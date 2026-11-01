// Usage-based products (2026-11-01): the Academy sells sessions for points and
// never takes money. Adds Session Pack (10 sessions, 100 points) and
// Organisation seat (unlimited, by request), retires the Pro month, and moves
// the demo self-serve customers to usage with a few packs each. One anonymous
// Apex run; safe to re-run.
//
//   sf apex run --file scripts/apex/crm-seed-usage.apex --target-org crma-learning

Database.DMLOptions o = new Database.DMLOptions();
o.DuplicateRuleHeader.allowSave = true;

Pricebook2 std = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
Pricebook2 pts = [SELECT Id FROM Pricebook2 WHERE Name = 'Academy Points' LIMIT 1];

Map<String, Product2> byCode = new Map<String, Product2>();
for (Product2 p : [SELECT Id, ProductCode, IsActive FROM Product2 WHERE ProductCode LIKE 'ACAD-%']) byCode.put(p.ProductCode, p);
List<Product2> fresh = new List<Product2>();
if (!byCode.containsKey('ACAD-PACK-10')) fresh.add(new Product2(Name = 'Academy Session Pack (10 sessions)', ProductCode = 'ACAD-PACK-10', Family = 'Academy', IsActive = true, Description = 'Ten more sessions for 100 points. Points are earned by learning; the Academy never takes money.'));
if (!byCode.containsKey('ACAD-ORG')) fresh.add(new Product2(Name = 'Academy Organisation Seat', ProductCode = 'ACAD-ORG', Family = 'Academy', IsActive = true, Description = 'Unlimited sessions for one member of a company, team or university. Free, by request or by email domain.'));
insert fresh;
List<PricebookEntry> entries = new List<PricebookEntry>();
for (Product2 p : fresh) {
    Decimal points = p.ProductCode == 'ACAD-PACK-10' ? 100 : 0;
    entries.add(new PricebookEntry(Pricebook2Id = std.Id, Product2Id = p.Id, UnitPrice = 0, IsActive = true));
    entries.add(new PricebookEntry(Pricebook2Id = pts.Id, Product2Id = p.Id, UnitPrice = points, IsActive = true));
}
insert entries;
if (byCode.containsKey('ACAD-PRO') && byCode.get('ACAD-PRO').IsActive) {
    update new Product2(Id = byCode.get('ACAD-PRO').Id, IsActive = false, Description = 'Retired 2026-11-01: access is usage-based (sessions) now.');
}
// The seat product is now the organisation seat: unlimited, free.
List<PricebookEntry> seatPrices = [SELECT Id, UnitPrice FROM PricebookEntry WHERE Product2.ProductCode = 'ACAD-SEAT' AND UnitPrice != 0];
for (PricebookEntry e : seatPrices) e.UnitPrice = 0;
update seatPrices;

// Demo self-serve customers → usage, with packs.
List<Account> selfServe = [SELECT Id, Name, Points_Spent__c, Lifecycle_Stage__c FROM Account WHERE Website LIKE 'https://example.com/selfserve-%' AND Sessions_Bought__c = null];
List<Opportunity> packs = new List<Opportunity>();
Integer i = 0;
for (Account a : selfServe) {
    Integer n = 1 + Math.mod(i, 4);
    a.Academy_Plan__c = a.Lifecycle_Stage__c == 'churned' ? 'free' : 'usage';
    a.Sessions_Bought__c = n * 10;
    a.Points_Spent__c = (a.Points_Spent__c == null ? 0 : a.Points_Spent__c) + n * 100;
    for (Integer k = 0; k < n; k++) {
        packs.add(new Opportunity(AccountId = a.Id, Name = 'Session pack — 10 sessions', StageName = 'Closed Won', CloseDate = Date.today().addDays(-7 * k - i),
            Amount = 100, Paid_In__c = 'points', Points_Amount__c = 100, LeadSource = 'Web', Description = 'Academy demo pack: 10 sessions for 100 points.'));
    }
    i++;
}
Database.update(selfServe, o);
Database.insert(packs, o);
System.debug('Usage products ready: ' + fresh.size() + ' new products; ' + seatPrices.size() + ' seat prices set to 0; ' + selfServe.size() + ' self-serve customers moved to usage with ' + packs.size() + ' packs.');
