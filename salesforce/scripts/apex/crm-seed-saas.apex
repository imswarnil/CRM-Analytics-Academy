// SaaS products with real USD prices (2026-11-03): Pro monthly/yearly, Team
// seat, and the two sponsorship packages — in the Standard Price Book. Retires
// the points-era session pack. Gives the demo self-serve customers Pro
// subscriptions and adds two sponsorship prospects. One anonymous Apex run;
// safe to re-run.
//
//   sf apex run --file scripts/apex/crm-seed-saas.apex --target-org crma-learning

Database.DMLOptions o = new Database.DMLOptions();
o.DuplicateRuleHeader.allowSave = true;
Pricebook2 std = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];

Map<String, Decimal> prices = new Map<String, Decimal>{ 'ACAD-PRO-M' => 15, 'ACAD-PRO-Y' => 150, 'ACAD-TEAM' => 10, 'ACAD-SPON-7' => 99, 'ACAD-SPON-30' => 299 };
Map<String, String> names = new Map<String, String>{
    'ACAD-PRO-M' => 'Academy Pro — monthly', 'ACAD-PRO-Y' => 'Academy Pro — yearly', 'ACAD-TEAM' => 'Academy Team seat (monthly)',
    'ACAD-SPON-7' => 'Academy Sponsorship — 7 days', 'ACAD-SPON-30' => 'Academy Sponsorship — 30 days' };
Set<String> have = new Set<String>();
for (Product2 p : [SELECT ProductCode FROM Product2 WHERE ProductCode IN :prices.keySet()]) have.add(p.ProductCode);
List<Product2> fresh = new List<Product2>();
for (String code : prices.keySet()) {
    if (!have.contains(code)) fresh.add(new Product2(Name = names.get(code), ProductCode = code, Family = code.startsWith('ACAD-SPON') ? 'Sponsorship' : 'Academy', IsActive = true));
}
insert fresh;
List<PricebookEntry> entries = new List<PricebookEntry>();
for (Product2 p : fresh) entries.add(new PricebookEntry(Pricebook2Id = std.Id, Product2Id = p.Id, UnitPrice = prices.get(p.ProductCode), IsActive = true));
insert entries;
List<Product2> retire = [SELECT Id FROM Product2 WHERE ProductCode IN ('ACAD-PACK-10', 'ACAD-PRO') AND IsActive = true];
for (Product2 p : retire) p.IsActive = false;
update retire;

// Demo self-serve customers on Pro (monthly), once.
List<Account> selfServe = [SELECT Id, Lifecycle_Stage__c FROM Account WHERE Website LIKE 'https://example.com/selfserve-%' AND Lifecycle_Stage__c = 'customer' AND MRR__c != 15 LIMIT 3];
List<Opportunity> deals = new List<Opportunity>();
for (Account a : selfServe) {
    a.Academy_Plan__c = 'pro';
    a.MRR__c = 15;
    deals.add(new Opportunity(AccountId = a.Id, Name = 'Pro — monthly', StageName = 'Closed Won', CloseDate = Date.today().addDays(-3), Amount = 15, Paid_In__c = 'usd', Seats__c = 1, LeadSource = 'Web', Description = 'Academy demo: Stripe subscription.'));
}
Database.update(selfServe, o);
Database.insert(deals, o);

// Two sponsorship prospects, sales-led.
List<Lead> sponsors = new List<Lead>();
if ([SELECT COUNT() FROM Lead WHERE Email = 'partnerships@datalens.example.com'] == 0) {
    sponsors.add(new Lead(LastName = 'DataLens Partnerships', Company = 'DataLens', Email = 'partnerships@datalens.example.com', LeadSource = 'Web', Status = 'Open - Not Contacted',
        Academy_Interest__c = 'sponsorship', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Traffic_Source__c = 'linkedin.com', Landing_Page__c = '/sponsor', Description = 'Sponsorship request: sponsorMonth (30 days, 299 USD).'));
    sponsors.add(new Lead(LastName = 'Analytics Cloud Partners', Company = 'ACP Consulting', Email = 'hello@acp.example.com', LeadSource = 'Web', Status = 'Working - Contacted',
        Academy_Interest__c = 'sponsorship', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Traffic_Source__c = 'google.com', Landing_Page__c = '/sponsor', Description = 'Sponsorship request: sponsorWeek (7 days, 99 USD).'));
}
Database.insert(sponsors, o);
System.debug('SaaS products: ' + fresh.size() + ' new, ' + retire.size() + ' retired; ' + selfServe.size() + ' demo customers on Pro; ' + sponsors.size() + ' sponsor prospects.');
