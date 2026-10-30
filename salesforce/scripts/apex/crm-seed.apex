// Academy CRM — products, price books and demo data, in ONE anonymous Apex run.
//
//   sf apex run --file scripts/apex/crm-seed.apex --target-org crma-learning
//
// One call on purpose: the org was frozen once, so nothing here loops over the
// API. Safe to re-run — it stops if the demo data is already there (remove it
// with scripts/apex/crm-seed-remove.apex). Every demo record carries
// "[academy-demo]" in its description; every email is @example.com.
//
// Points, not money (yet): the "Academy Points" price book holds prices in
// points (the org's currency symbol shows, the number is points); the
// Standard Price Book holds the USD price each plan will have later.

String TAG = '[academy-demo]';
if ([SELECT COUNT() FROM Account WHERE Description LIKE '%[academy-demo]%'] > 0) {
    System.debug('Academy demo data already present — nothing to do.');
} else {

    // --- Permission set for the running admin -----------------------------------
    try {
        Id ps = [SELECT Id FROM PermissionSet WHERE Name = 'Academy_CRM_Access' LIMIT 1].Id;
        if ([SELECT COUNT() FROM PermissionSetAssignment WHERE AssigneeId = :UserInfo.getUserId() AND PermissionSetId = :ps] == 0) {
            insert new PermissionSetAssignment(AssigneeId = UserInfo.getUserId(), PermissionSetId = ps);
        }
    } catch (Exception e) { System.debug('Permission set: ' + e.getMessage()); }

    // --- Products and price books -------------------------------------------------
    Pricebook2 std = [SELECT Id, IsActive FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
    if (!std.IsActive) { std.IsActive = true; update std; }
    Pricebook2 pts = new Pricebook2(Name = 'Academy Points', IsActive = true, Description = 'Prices in points (1 point = 1 unit of currency shown). ' + TAG);
    insert pts;

    List<Product2> products = new List<Product2>{
        new Product2(Name = 'Academy Free', ProductCode = 'ACAD-FREE', Family = 'Academy', IsActive = true, Description = 'Every public lesson, exams, interview bank, visualisers. ' + TAG),
        new Product2(Name = 'Academy Pro (30 days)', ProductCode = 'ACAD-PRO', Family = 'Academy', IsActive = true, Description = 'Every Pro lesson for 30 days. 1,000 points now; USD 12 a month later. ' + TAG),
        new Product2(Name = 'Academy Seat (per month)', ProductCode = 'ACAD-SEAT', Family = 'Academy', IsActive = true, Description = 'Pro for one member of a company, team or university, per month. ' + TAG)
    };
    insert products;
    Map<String, Decimal> usd = new Map<String, Decimal>{ 'ACAD-FREE' => 0, 'ACAD-PRO' => 12, 'ACAD-SEAT' => 15 };
    Map<String, Decimal> points = new Map<String, Decimal>{ 'ACAD-FREE' => 0, 'ACAD-PRO' => 1000, 'ACAD-SEAT' => 1000 };
    List<PricebookEntry> stdEntries = new List<PricebookEntry>();
    for (Product2 p : products) stdEntries.add(new PricebookEntry(Pricebook2Id = std.Id, Product2Id = p.Id, UnitPrice = usd.get(p.ProductCode), IsActive = true));
    insert stdEntries;
    List<PricebookEntry> ptEntries = new List<PricebookEntry>();
    for (Product2 p : products) ptEntries.add(new PricebookEntry(Pricebook2Id = pts.Id, Product2Id = p.Id, UnitPrice = points.get(p.ProductCode), IsActive = true));
    insert ptEntries;
    Id seatEntry;
    for (PricebookEntry e : ptEntries) if (e.Product2Id == products[2].Id) seatEntry = e.Id;

    // --- Organisations ---------------------------------------------------------------
    List<Account> orgs = new List<Account>{
        new Account(Name = 'Northwind Analytics', Industry = 'Technology', Org_Type__c = 'company', Academy_Plan__c = 'seats', Seats_Purchased__c = 25, Join_Code__c = 'NWND7K2Q', Seat_Term_End__c = Date.today().addMonths(11), Website = 'https://example.com/northwind', Description = 'Analytics consultancy training its delivery team. ' + TAG),
        new Account(Name = 'Lakeside University', Industry = 'Education', Org_Type__c = 'university', Academy_Plan__c = 'free', Description = 'Business school; wants seats for an MBA analytics elective. ' + TAG),
        new Account(Name = 'Brightpath Consulting', Industry = 'Consulting', Org_Type__c = 'team', Academy_Plan__c = 'seats', Seats_Purchased__c = 8, Join_Code__c = 'BRPT4M8X', Seat_Term_End__c = Date.today().addMonths(5), Description = 'Small Salesforce partner team. ' + TAG),
        new Account(Name = 'Sierra Health Group', Industry = 'Healthcare', Org_Type__c = 'company', Academy_Plan__c = 'free', Description = 'RevOps team moving reports to CRM Analytics. ' + TAG),
        new Account(Name = 'Kaveri Institute of Technology', Industry = 'Education', Org_Type__c = 'university', Academy_Plan__c = 'free', Description = 'Engineering college; placement cell asked for Salesforce analytics training. ' + TAG)
    };
    insert orgs;

    // --- People ---------------------------------------------------------------------------
    List<Contact> people = new List<Contact>{
        new Contact(AccountId = orgs[0].Id, FirstName = 'Priya', LastName = 'Nair', Title = 'Head of Delivery', Email = 'priya.nair@example.com', Is_Pro__c = true, Academy_Points__c = 640, Description = TAG),
        new Contact(AccountId = orgs[0].Id, FirstName = 'Tom', LastName = 'Becker', Title = 'Analytics Consultant', Email = 'tom.becker@example.com', Is_Pro__c = true, Academy_Points__c = 310, Description = TAG),
        new Contact(AccountId = orgs[0].Id, FirstName = 'Lena', LastName = 'Hoffmann', Title = 'Analytics Consultant', Email = 'lena.hoffmann@example.com', Is_Pro__c = true, Academy_Points__c = 220, Description = TAG),
        new Contact(AccountId = orgs[1].Id, FirstName = 'Margaret', LastName = 'Okafor', Title = 'Programme Director, MBA', Email = 'm.okafor@example.com', Description = TAG),
        new Contact(AccountId = orgs[1].Id, FirstName = 'David', LastName = 'Lindqvist', Title = 'IT Procurement', Email = 'd.lindqvist@example.com', Description = TAG),
        new Contact(AccountId = orgs[2].Id, FirstName = 'Arjun', LastName = 'Mehta', Title = 'Founder', Email = 'arjun@example.com', Is_Pro__c = true, Academy_Points__c = 980, Description = TAG),
        new Contact(AccountId = orgs[2].Id, FirstName = 'Sofia', LastName = 'Ruiz', Title = 'Salesforce Developer', Email = 'sofia.ruiz@example.com', Is_Pro__c = true, Academy_Points__c = 150, Description = TAG),
        new Contact(AccountId = orgs[3].Id, FirstName = 'Grace', LastName = 'Chen', Title = 'Director of RevOps', Email = 'grace.chen@example.com', Description = TAG),
        new Contact(AccountId = orgs[4].Id, FirstName = 'Ramesh', LastName = 'Iyer', Title = 'Training and Placement Officer', Email = 'ramesh.iyer@example.com', Description = TAG)
    };
    insert people;

    // --- Seat deals (priced in points: 1,000 per seat per month, 12 months) -----------------
    List<Opportunity> deals = new List<Opportunity>{
        new Opportunity(AccountId = orgs[0].Id, Name = 'Northwind — 25 seats', StageName = 'Closed Won', CloseDate = Date.today().addDays(-30), Seats__c = 25, Paid_In__c = 'points', Pricebook2Id = pts.Id, LeadSource = 'Web', Description = TAG),
        new Opportunity(AccountId = orgs[1].Id, Name = 'Lakeside — MBA elective, 60 seats', StageName = 'Negotiation/Review', CloseDate = Date.today().addDays(21), Seats__c = 60, Paid_In__c = 'points', Pricebook2Id = pts.Id, LeadSource = 'Web', Description = TAG),
        new Opportunity(AccountId = orgs[2].Id, Name = 'Brightpath — 8 seats', StageName = 'Closed Won', CloseDate = Date.today().addDays(-60), Seats__c = 8, Paid_In__c = 'points', Pricebook2Id = pts.Id, LeadSource = 'Web', Description = TAG),
        new Opportunity(AccountId = orgs[3].Id, Name = 'Sierra Health — RevOps team, 40 seats', StageName = 'Proposal/Price Quote', CloseDate = Date.today().addDays(35), Seats__c = 40, Paid_In__c = 'points', Pricebook2Id = pts.Id, LeadSource = 'Web', Description = TAG),
        new Opportunity(AccountId = orgs[4].Id, Name = 'Kaveri — placement cohort, 120 seats', StageName = 'Qualification', CloseDate = Date.today().addDays(60), Seats__c = 120, Paid_In__c = 'points', Pricebook2Id = pts.Id, LeadSource = 'Web', Description = TAG),
        new Opportunity(AccountId = orgs[3].Id, Name = 'Sierra Health — dashboard review', StageName = 'Closed Lost', CloseDate = Date.today().addDays(-10), Seats__c = 0, Paid_In__c = 'usd', LeadSource = 'Web', Description = 'Chose an internal build. ' + TAG)
    };
    insert deals;
    List<OpportunityLineItem> lines = new List<OpportunityLineItem>();
    for (Opportunity o : deals) {
        if (o.Seats__c == null || o.Seats__c == 0) continue;
        lines.add(new OpportunityLineItem(OpportunityId = o.Id, PricebookEntryId = seatEntry, Quantity = o.Seats__c * 12, UnitPrice = 1000, Description = o.Seats__c + ' seats × 12 months'));
    }
    insert lines;
    for (Opportunity o : deals) if (o.Seats__c != null) o.Points_Amount__c = o.Seats__c * 12 * 1000;
    update deals;

    // --- Seats taken (Northwind and Brightpath are live) -------------------------------------
    List<Seat_Assignment__c> seats = new List<Seat_Assignment__c>();
    Integer n = 0;
    for (Contact c : people) {
        if (c.AccountId != orgs[0].Id && c.AccountId != orgs[2].Id) continue;
        seats.add(new Seat_Assignment__c(Account__c = c.AccountId, Contact__c = c.Id, Status__c = 'active', Role__c = (n == 0 || c.FirstName == 'Arjun') ? 'admin' : 'member', Joined_On__c = Date.today().addDays(-25 + n)));
        n++;
    }
    insert seats;
    orgs[0].Seats_Used__c = 3;
    orgs[2].Seats_Used__c = 2;
    update new List<Account>{ orgs[0], orgs[2] };

    // --- Prospects from the site (what Web-to-Lead creates) -------------------------------------
    List<Lead> leads = new List<Lead>{
        new Lead(FirstName = 'Hannah', LastName = 'Wells', Company = 'Meridian Retail', Title = 'BI Manager', Email = 'hannah.wells@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 15, Org_Type__c = 'company', Traffic_Source__c = 'google.com', First_Landing_Page__c = '/saql/what-is-saql', Landing_Page__c = '/pro', Views_Before_Lead__c = 14, Academy_Lessons_Done__c = 3, Academy_Points__c = 30, Academy_Locale__c = 'en', Description = TAG),
        new Lead(FirstName = 'Kenji', LastName = 'Sato', Company = 'Tokai Logistics', Title = 'Salesforce Admin', Email = 'kenji.sato@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Academy_Interest__c = 'salesforce-setup', Traffic_Source__c = 'utm:youtube', First_Landing_Page__c = '/ja/introduction/set-up-your-org', Landing_Page__c = '/ja/pro', Views_Before_Lead__c = 6, Academy_Lessons_Done__c = 5, Academy_Points__c = 62, Academy_Locale__c = 'ja', Academy_User_Id__c = 'demo-user-kenji', Description = TAG),
        new Lead(FirstName = 'Amara', LastName = 'Diallo', Company = 'Université de Dakar', Title = 'Lecturer, Information Systems', Email = 'a.diallo@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 80, Org_Type__c = 'university', Traffic_Source__c = 'linkedin.com', First_Landing_Page__c = '/fr', Landing_Page__c = '/fr/pro', Views_Before_Lead__c = 9, Academy_Locale__c = 'fr', Description = TAG),
        new Lead(FirstName = 'Oliver', LastName = 'Grant', Company = 'Grant & Co', Title = 'Owner', Email = 'oliver@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Academy_Interest__c = 'consulting', Traffic_Source__c = 'chatgpt.com', First_Landing_Page__c = '/interview-questions/how-does-saql-differ-from-sql', Landing_Page__c = '/pro', Views_Before_Lead__c = 3, Academy_Locale__c = 'en', Description = TAG),
        new Lead(FirstName = 'Neha', LastName = 'Kulkarni', Company = 'Neha Kulkarni (individual)', Email = 'neha.k@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'mentoring', Traffic_Source__c = 'utm:linkedin', First_Landing_Page__c = '/certification', Landing_Page__c = '/pro', Views_Before_Lead__c = 22, Academy_Lessons_Done__c = 8, Academy_Points__c = 112, Academy_Locale__c = 'hi', Academy_User_Id__c = 'demo-user-neha', Description = TAG),
        new Lead(FirstName = 'Carlos', LastName = 'Mendes', Company = 'Banco Atlântico', Title = 'Head of Sales Ops', Email = 'c.mendes@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 30, Org_Type__c = 'company', Traffic_Source__c = 'direct', First_Landing_Page__c = '/pt/visualiser/recipe', Landing_Page__c = '/pt/pro', Views_Before_Lead__c = 11, Academy_Locale__c = 'pt', Description = TAG),
        new Lead(FirstName = 'Fatima', LastName = 'Rahman', Company = 'Dhaka Data Lab', Title = 'Team Lead', Email = 'fatima@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 6, Org_Type__c = 'team', Traffic_Source__c = 'google.com', First_Landing_Page__c = '/bn/visualiser/saql', Landing_Page__c = '/bn/pro', Views_Before_Lead__c = 17, Academy_Lessons_Done__c = 7, Academy_Points__c = 90, Academy_Locale__c = 'bn', Academy_User_Id__c = 'demo-user-fatima', Description = TAG),
        new Lead(FirstName = 'Ivan', LastName = 'Petrov', Company = 'Ivan Petrov (individual)', Email = 'ivan.p@example.com', LeadSource = 'Web', Status = 'Closed - Not Converted', Academy_Interest__c = 'mentoring', Traffic_Source__c = 'utm:x', First_Landing_Page__c = '/ru', Landing_Page__c = '/ru/pro', Views_Before_Lead__c = 2, Academy_Locale__c = 'ru', Description = 'Wanted free mentoring only. ' + TAG),
        new Lead(FirstName = 'Leila', LastName = 'Haddad', Company = 'Gulf Retail Group', Title = 'CRM Director', Email = 'l.haddad@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'salesforce-setup', Traffic_Source__c = 'perplexity.ai', First_Landing_Page__c = '/ar/foundations', Landing_Page__c = '/ar/pro', Views_Before_Lead__c = 5, Academy_Locale__c = 'ar', Description = TAG),
        new Lead(FirstName = 'Ben', LastName = 'Fischer', Company = 'Alpine Insurance', Title = 'Analytics Engineer', Email = 'ben.fischer@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 12, Org_Type__c = 'company', Traffic_Source__c = 'utm:newsletter', First_Landing_Page__c = '/de/visualiser/dataflow', Landing_Page__c = '/de/pro', Views_Before_Lead__c = 26, Academy_Lessons_Done__c = 8, Academy_Points__c = 140, Academy_Locale__c = 'de', Academy_User_Id__c = 'demo-user-ben', Description = TAG),
        new Lead(FirstName = 'Mei', LastName = 'Lin', Company = 'Shenzhen Polytechnic', Title = 'Dean of Business', Email = 'mei.lin@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 200, Org_Type__c = 'university', Traffic_Source__c = 'bing.com', First_Landing_Page__c = '/zh', Landing_Page__c = '/zh/pro', Views_Before_Lead__c = 4, Academy_Locale__c = 'zh', Description = TAG),
        new Lead(FirstName = 'Ayesha', LastName = 'Siddiqui', Company = 'Ayesha Siddiqui (individual)', Email = 'ayesha.s@example.com', LeadSource = 'Web', Status = 'Open - Not Contacted', Academy_Interest__c = 'consulting', Traffic_Source__c = 'utm:whatsapp', First_Landing_Page__c = '/ur/interview-questions', Landing_Page__c = '/ur/pro', Views_Before_Lead__c = 8, Academy_Lessons_Done__c = 2, Academy_Points__c = 24, Academy_Locale__c = 'ur', Academy_User_Id__c = 'demo-user-ayesha', Description = TAG),
        new Lead(FirstName = 'Sam', LastName = 'Okoro', Company = 'Orbit Retail', Title = 'VP Revenue Operations', Email = 'sam.okoro@example.com', LeadSource = 'Web', Status = 'Working - Contacted', Academy_Interest__c = 'seats', Seats_Requested__c = 20, Org_Type__c = 'company', Traffic_Source__c = 'google.com', First_Landing_Page__c = '/visualiser', Landing_Page__c = '/pro', Views_Before_Lead__c = 31, Academy_Lessons_Done__c = 8, Academy_Points__c = 160, Academy_Locale__c = 'en', Academy_User_Id__c = 'demo-user-sam', Description = 'Qualified on a discovery call — convert. ' + TAG)
    };
    insert leads;

    // --- Prospecting cadence: follow-up tasks on worked leads -----------------------------------
    List<Task> tasks = new List<Task>();
    for (Lead l : leads) {
        if (l.Status != 'Working - Contacted') continue;
        tasks.add(new Task(WhoId = l.Id, Subject = 'Discovery call: ' + l.Academy_Interest__c, ActivityDate = Date.today().addDays(2), Status = 'Not Started', Priority = 'High', Description = 'Confirm seats, timeline, who manages the team. ' + TAG));
        tasks.add(new Task(WhoId = l.Id, Subject = 'Send the visualiser + Pro sample lesson', ActivityDate = Date.today().addDays(5), Status = 'Not Started', Priority = 'Normal', Description = TAG));
    }
    insert tasks;

    // --- Convert the qualified lead: account, contact and a seat deal ------------------------------
    try {
        LeadStatus converted = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = true LIMIT 1];
        Database.LeadConvert lc = new Database.LeadConvert();
        lc.setLeadId(leads[leads.size() - 1].Id);
        lc.setConvertedStatus(converted.MasterLabel);
        lc.setOpportunityName('Orbit Retail — 20 seats');
        Database.LeadConvertResult r = Database.convertLead(lc);
        update new Account(Id = r.getAccountId(), Org_Type__c = 'company', Academy_Plan__c = 'free', Description = 'Converted from a site lead. ' + TAG);
        update new Opportunity(Id = r.getOpportunityId(), StageName = 'Needs Analysis', CloseDate = Date.today().addDays(45), Seats__c = 20, Paid_In__c = 'points', Points_Amount__c = 20 * 12 * 1000, LeadSource = 'Web', Description = TAG);
    } catch (Exception e) { System.debug('Lead conversion skipped: ' + e.getMessage()); }

    System.debug('Academy CRM seeded: 3 products, 2 price books, ' + orgs.size() + ' organisations, ' + people.size() + ' contacts, ' + deals.size() + ' deals, ' + seats.size() + ' seats, ' + leads.size() + ' leads, ' + tasks.size() + ' tasks.');
}
