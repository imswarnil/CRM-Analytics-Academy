// The Academy's own CRM data, at the 2026-11-18 prices. Run after
// crm-reset.apex (or on a fresh org). Everything demo uses @example.com /
// https://example.com/ so crm-seed-remove.apex can take it out again.
// Safe to re-run: it stops if the demo data is already there.
//
//   Products (Standard price book, USD):
//     ACAD-FREE 0 · ACAD-PRO-M 49/mo · ACAD-PRO-Y 149/yr · ACAD-PRO-L 299 once
//     ACAD-SEAT 99 per seat per year (list; teams are quoted)
//   Customers: self-serve Pro (monthly, yearly, lifetime), a company and a
//   college on seats with members. Pipeline: two open seat deals. Leads at
//   every lifecycle stage, so every list view, report and the home page
//   pulse have something to show.
//
//   sf apex run --file scripts/apex/crm-seed-2026.apex --target-org crma-learning

Database.DMLOptions o = new Database.DMLOptions();
o.DuplicateRuleHeader.allowSave = true;
String WEB = 'https://example.com/';

if ([SELECT COUNT() FROM Account WHERE Website LIKE 'https://example.com/%'] > 0) {
    System.debug('Academy demo data is already here. Run crm-seed-remove.apex first to start over.');
    return;
}

// --- Products and prices ------------------------------------------------------
Pricebook2 std = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
Map<String, Decimal> price = new Map<String, Decimal>{ 'ACAD-FREE' => 0, 'ACAD-PRO-M' => 49, 'ACAD-PRO-Y' => 149, 'ACAD-PRO-L' => 299, 'ACAD-SEAT' => 99 };
Map<String, String> pname = new Map<String, String>{
    'ACAD-FREE' => 'Academy Free', 'ACAD-PRO-M' => 'Academy Pro — monthly', 'ACAD-PRO-Y' => 'Academy Pro — yearly',
    'ACAD-PRO-L' => 'Academy Pro — lifetime', 'ACAD-SEAT' => 'Academy seat (per seat, per year)' };
Map<String, String> pdesc = new Map<String, String>{
    'ACAD-FREE' => 'Every free lesson, the practice exam and interview Q&A. With ads.',
    'ACAD-PRO-M' => 'Every lesson and dataset, full exam review, no ads. Stripe subscription, cancel any time.',
    'ACAD-PRO-Y' => 'Pro for a year. Stripe subscription.',
    'ACAD-PRO-L' => 'Pro forever, one payment. Adds no MRR.',
    'ACAD-SEAT' => 'Pro for one member of a company, college or team. List price; deals are quoted.' };
Map<String, Product2> byCode = new Map<String, Product2>();
for (Product2 p : [SELECT Id, ProductCode, IsActive FROM Product2 WHERE ProductCode LIKE 'ACAD-%']) byCode.put(p.ProductCode, p);
List<Product2> upsertP = new List<Product2>();
for (String code : price.keySet()) {
    Product2 p = byCode.containsKey(code) ? byCode.get(code) : new Product2(ProductCode = code);
    p.Name = pname.get(code); p.Description = pdesc.get(code); p.Family = 'Academy'; p.IsActive = true;
    upsertP.add(p);
}
upsert upsertP;
// Retire the older offers (points era, $15 Pro, sponsorships).
List<Product2> retire = [SELECT Id FROM Product2 WHERE ProductCode LIKE 'ACAD-%' AND ProductCode NOT IN :price.keySet() AND IsActive = true];
for (Product2 p : retire) p.IsActive = false;
update retire;
List<Pricebook2> points = [SELECT Id FROM Pricebook2 WHERE Name = 'Academy Points' AND IsActive = true];
for (Pricebook2 b : points) b.IsActive = false;
update points;
Map<Id, PricebookEntry> entryOf = new Map<Id, PricebookEntry>();
for (PricebookEntry e : [SELECT Id, Product2Id, UnitPrice FROM PricebookEntry WHERE Pricebook2Id = :std.Id AND Product2Id IN :upsertP]) entryOf.put(e.Product2Id, e);
List<PricebookEntry> entries = new List<PricebookEntry>();
for (Product2 p : upsertP) {
    PricebookEntry e = entryOf.containsKey(p.Id) ? entryOf.get(p.Id) : new PricebookEntry(Pricebook2Id = std.Id, Product2Id = p.Id);
    e.UnitPrice = price.get(p.ProductCode); e.IsActive = true;
    entries.add(e);
}
upsert entries;

// --- Customers ------------------------------------------------------------------
List<Account> accts = new List<Account>{
    new Account(Name = 'Asha Rao (self-serve)', Website = WEB + 'selfserve-asha', Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Plan__c = 'pro', MRR__c = 49, Customer_Since__c = Date.today().addDays(-40)),
    new Account(Name = 'Diego Morales (self-serve)', Website = WEB + 'selfserve-diego', Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Plan__c = 'pro', MRR__c = 12.42, Customer_Since__c = Date.today().addDays(-95)),
    new Account(Name = 'Mei Tanaka (self-serve)', Website = WEB + 'selfserve-mei', Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Plan__c = 'pro', MRR__c = 0, Customer_Since__c = Date.today().addDays(-12)),
    new Account(Name = 'Lena Fischer (self-serve)', Website = WEB + 'selfserve-lena', Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Plan__c = 'pro', MRR__c = 49, Customer_Since__c = Date.today().addDays(-7)),
    new Account(Name = 'Northwind Revenue Ops', Website = WEB + 'northwind', Industry = 'Technology', Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led', Academy_Plan__c = 'seats', Org_Type__c = 'company', Seats_Purchased__c = 25, Seats_Used__c = 3, Join_Code__c = 'NORTHWIND-25', Seat_Term_End__c = Date.today().addDays(300), MRR__c = 206.25, Customer_Since__c = Date.today().addDays(-65)),
    new Account(Name = 'Pune Institute of Technology', Website = WEB + 'pit', Industry = 'Education', Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led', Academy_Plan__c = 'seats', Org_Type__c = 'university', Seats_Purchased__c = 120, Seats_Used__c = 3, Join_Code__c = 'PIT-2026', Seat_Term_End__c = Date.today().addDays(250), MRR__c = 990, Customer_Since__c = Date.today().addDays(-115)),
    // Pipeline
    new Account(Name = 'Contoso Sales Analytics', Website = WEB + 'contoso', Industry = 'Technology', Lifecycle_Stage__c = 'opportunity', Motion__c = 'sales-led', Org_Type__c = 'company'),
    new Account(Name = 'Lisbon School of Business', Website = WEB + 'lsb', Industry = 'Education', Lifecycle_Stage__c = 'opportunity', Motion__c = 'sales-led', Org_Type__c = 'university')
};
for (Account a : accts) a.ARR__c = a.MRR__c == null ? null : a.MRR__c * 12;
Database.insert(accts, o);
Map<String, Account> acct = new Map<String, Account>();
for (Account a : accts) acct.put(a.Website.substringAfter(WEB), a);

List<Contact> people = new List<Contact>{
    new Contact(AccountId = acct.get('selfserve-asha').Id, FirstName = 'Asha', LastName = 'Rao', Email = 'asha.rao@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Points__c = 1840),
    new Contact(AccountId = acct.get('selfserve-diego').Id, FirstName = 'Diego', LastName = 'Morales', Email = 'diego.morales@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Points__c = 2610),
    new Contact(AccountId = acct.get('selfserve-mei').Id, FirstName = 'Mei', LastName = 'Tanaka', Email = 'mei.tanaka@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Points__c = 1210),
    new Contact(AccountId = acct.get('selfserve-lena').Id, FirstName = 'Lena', LastName = 'Fischer', Email = 'lena.fischer@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve', Academy_Points__c = 1060),
    new Contact(AccountId = acct.get('northwind').Id, FirstName = 'Priya', LastName = 'Nair', Title = 'Director, Revenue Operations', Email = 'priya.nair@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('northwind').Id, FirstName = 'Tom', LastName = 'Becker', Title = 'Sales Analyst', Email = 'tom.becker@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('northwind').Id, FirstName = 'Sara', LastName = 'Lindqvist', Title = 'Marketing Analyst', Email = 'sara.lindqvist@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('pit').Id, FirstName = 'Rahul', LastName = 'Deshmukh', Title = 'Head, Training & Placement', Email = 'rahul.deshmukh@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('pit').Id, FirstName = 'Ananya', LastName = 'Kulkarni', Title = 'Student', Email = 'ananya.kulkarni@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('pit').Id, FirstName = 'Vikram', LastName = 'Joshi', Title = 'Student', Email = 'vikram.joshi@example.com', Is_Pro__c = true, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('contoso').Id, FirstName = 'Grace', LastName = 'Okafor', Title = 'VP Sales Operations', Email = 'grace.okafor@example.com', Lifecycle_Stage__c = 'opportunity', Motion__c = 'sales-led'),
    new Contact(AccountId = acct.get('lsb').Id, FirstName = 'João', LastName = 'Pereira', Title = 'Programme Director, Analytics', Email = 'joao.pereira@example.com', Lifecycle_Stage__c = 'opportunity', Motion__c = 'sales-led')
};
Database.insert(people, o);
Map<String, Id> who = new Map<String, Id>();
for (Contact c : people) who.put(c.Email, c.Id);

// Seats for the two organisations (the first member of each is its admin).
List<Seat_Assignment__c> seats = new List<Seat_Assignment__c>();
for (Contact c : people) {
    if (c.AccountId == acct.get('northwind').Id || c.AccountId == acct.get('pit').Id) {
        Boolean admin = c.Email.startsWith('priya') || c.Email.startsWith('rahul');
        seats.add(new Seat_Assignment__c(Account__c = c.AccountId, Contact__c = c.Id, Role__c = admin ? 'admin' : 'member', Status__c = 'active', Joined_On__c = Date.today().addDays(admin ? -60 : -20)));
    }
}
Database.insert(seats, o);

// --- Deals ----------------------------------------------------------------------
Opportunity won(Map<String, Account> acct, String key, String name, Decimal amount, Integer daysAgo, Decimal seatCount) {
    return new Opportunity(AccountId = acct.get(key).Id, Name = name, StageName = 'Closed Won', CloseDate = Date.today().addDays(-daysAgo),
        Amount = amount, Paid_In__c = 'usd', Seats__c = seatCount, LeadSource = 'Web', Description = 'Academy demo: paid through Stripe on the site.');
}
List<Opportunity> deals = new List<Opportunity>{
    won(acct, 'selfserve-asha', 'Pro — monthly', 49, 40, 1),
    won(acct, 'selfserve-asha', 'Pro — monthly (renewal)', 49, 10, 1),
    won(acct, 'selfserve-diego', 'Pro — yearly', 149, 95, 1),
    won(acct, 'selfserve-mei', 'Pro — lifetime', 299, 12, 1),
    won(acct, 'selfserve-lena', 'Pro — monthly', 49, 7, 1),
    won(acct, 'northwind', 'Northwind — 25 seats (annual)', 2475, 65, 25),
    won(acct, 'pit', 'Pune Institute of Technology — 120 student seats (annual)', 11880, 115, 120),
    new Opportunity(AccountId = acct.get('contoso').Id, Name = 'Contoso — 40 seats (annual)', StageName = 'Proposal/Price Quote', CloseDate = Date.today().addDays(21), Amount = 3960, Seats__c = 40, Paid_In__c = 'usd', LeadSource = 'Web', NextStep = 'Send the seat quote and the onboarding plan', Description = 'Analyst team of 40 learning CRM Analytics for a pipeline rebuild.'),
    new Opportunity(AccountId = acct.get('lsb').Id, Name = 'Lisbon School of Business — 200 student seats', StageName = 'Qualification', CloseDate = Date.today().addDays(45), Amount = 19800, Seats__c = 200, Paid_In__c = 'usd', LeadSource = 'Web', NextStep = 'Call with the programme director: semester dates and email domain', Description = 'MSc Business Analytics cohort; wants domain-restricted join.')
};
Database.insert(deals, o);
List<OpportunityLineItem> lines = new List<OpportunityLineItem>();
Map<String, Id> pbe = new Map<String, Id>();
for (PricebookEntry e : [SELECT Id, Product2.ProductCode FROM PricebookEntry WHERE Pricebook2Id = :std.Id AND Product2.ProductCode IN :price.keySet()]) pbe.put(e.Product2.ProductCode, e.Id);
for (Opportunity d : deals) {
    String code = d.Name.startsWith('Pro — lifetime') ? 'ACAD-PRO-L' : d.Name.startsWith('Pro — yearly') ? 'ACAD-PRO-Y' : d.Name.startsWith('Pro —') ? 'ACAD-PRO-M' : 'ACAD-SEAT';
    Decimal qty = code == 'ACAD-SEAT' ? d.Seats__c : 1;
    lines.add(new OpportunityLineItem(OpportunityId = d.Id, PricebookEntryId = pbe.get(code), Quantity = qty, UnitPrice = d.Amount / qty));
}
Database.insert(lines, o);

// --- Leads, one per stage of the funnel -----------------------------------------
List<Lead> leads = new List<Lead>{
    new Lead(FirstName = 'Kenji', LastName = 'Sato', Company = 'Kenji Sato (self-serve)', Email = 'kenji.sato@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Lifecycle_Stage__c = 'lead', Motion__c = 'self-serve', Academy_Interest__c = 'pro', Academy_Lessons_Done__c = 2, Academy_Locale__c = 'ja', Traffic_Source__c = 'youtube', First_Landing_Page__c = '/ja/start', Signup_Date__c = Date.today().addDays(-3)),
    new Lead(FirstName = 'Camille', LastName = 'Durand', Company = 'Camille Durand (self-serve)', Email = 'camille.durand@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Lifecycle_Stage__c = 'lead', Motion__c = 'self-serve', Academy_Interest__c = 'pro', Academy_Lessons_Done__c = 9, Academy_Locale__c = 'fr', Traffic_Source__c = 'google', First_Landing_Page__c = '/fr/certification', Signup_Date__c = Date.today().addDays(-1)),
    new Lead(FirstName = 'Arjun', LastName = 'Mehta', Company = 'Arjun Mehta (self-serve)', Email = 'arjun.mehta@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Lifecycle_Stage__c = 'mql', Motion__c = 'self-serve', Academy_Interest__c = 'pro', Academy_Lessons_Done__c = 10, Academy_User_Id__c = 'demo-arjun', Academy_Locale__c = 'hi', Traffic_Source__c = 'linkedin', First_Landing_Page__c = '/hi/interview-questions', Signup_Date__c = Date.today().addDays(-6)),
    new Lead(FirstName = 'Hannah', LastName = 'Weber', Company = 'Klarwerk GmbH', Title = 'Head of Sales Operations', Email = 'hannah.weber@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Academy_Interest__c = 'seats', Seats_Requested__c = 30, Org_Type__c = 'company', Academy_Locale__c = 'de', Traffic_Source__c = 'google', First_Landing_Page__c = '/de/pro', Landing_Page__c = '/pro', Description = 'Start: This quarter'),
    new Lead(FirstName = 'Lucía', LastName = 'Gómez', Company = 'Universidad de Valencia — Business School', Title = 'Course Lead, Data Analytics', Email = 'lucia.gomez@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Academy_Interest__c = 'seats', Seats_Requested__c = 80, Org_Type__c = 'university', Academy_Locale__c = 'es', Traffic_Source__c = 'direct', First_Landing_Page__c = '/es/start', Landing_Page__c = '/pro', Description = 'Start: This month'),
    new Lead(FirstName = 'Michael', LastName = 'Brown', Company = 'Brightline SaaS', Title = 'Salesforce Admin', Email = 'michael.brown@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Academy_Interest__c = 'salesforce-setup', Traffic_Source__c = 'youtube', First_Landing_Page__c = '/salesforce-foundations/objects-fields-and-relationships', Landing_Page__c = '/pro', Description = 'Needs CRM Analytics turned on and a first pipeline dashboard.'),
    new Lead(FirstName = 'Olivia', LastName = 'Chen', Company = 'Northbeam Partners', Title = 'Managing Partner', Email = 'olivia.chen@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led', Academy_Interest__c = 'consulting', Traffic_Source__c = 'linkedin', Landing_Page__c = '/pro', Description = 'Wants a review of their revenue dashboards before the board meeting.'),
    new Lead(FirstName = 'Sam', LastName = 'Patel', Company = 'Sam Patel (student)', Email = 'sam.patel@example.com', LeadSource = 'Web', Status = 'Closed - Not Converted', Lifecycle_Stage__c = 'lead', Motion__c = 'sales-led', Academy_Interest__c = 'mentoring', Landing_Page__c = '/pro', Description = 'Student asking for free mentoring; pointed to the free course and the interview bank.')
};
Database.insert(leads, o);

System.debug('Academy CRM seeded: ' + upsertP.size() + ' products, ' + accts.size() + ' accounts, ' + people.size() + ' contacts, '
    + seats.size() + ' seats, ' + deals.size() + ' deals, ' + leads.size() + ' leads.');
