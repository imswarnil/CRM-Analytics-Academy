// More Academy demo records, so every report, list view and widget has
// something to show: a full funnel of leads, self-serve customers with
// monthly Pro deals (one churned, one about to lapse), more members on
// Northwind's seats, discovery meetings and support cases for the Service
// Console. One anonymous Apex run; skips itself if already loaded. Everything
// is on example.com, so scripts/apex/crm-seed-remove.apex removes it.
//
//   sf apex run --file scripts/apex/crm-seed-funnel.apex --target-org crma-learning

if ([SELECT COUNT() FROM Account WHERE Website = 'https://example.com/selfserve-1'] > 0) {
    System.debug('Funnel demo data already present — nothing to do.');
} else {
    Database.DMLOptions o = new Database.DMLOptions();
    o.DuplicateRuleHeader.allowSave = true;

    // --- A funnel of leads ---------------------------------------------------------
    String[] first = new String[]{ 'Aarav', 'Bianca', 'Chloe', 'Dmitri', 'Elif', 'Farah', 'Gabriel', 'Hiro', 'Isha', 'Jonas', 'Kavya', 'Liam', 'Maya', 'Nikhil', 'Olga', 'Pedro', 'Qiu', 'Rohan', 'Sara', 'Tunde' };
    String[] last = new String[]{ 'Shah', 'Rossi', 'Martin', 'Volkov', 'Kaya', 'Haddad', 'Silva', 'Tanaka', 'Verma', 'Berg', 'Reddy', 'Walsh', 'Cohen', 'Joshi', 'Ivanova', 'Costa', 'Zhang', 'Kapoor', 'Nilsson', 'Adeyemi' };
    String[] sources = new String[]{ 'google.com', 'chatgpt.com', 'perplexity.ai', 'utm:youtube', 'utm:linkedin', 'linkedin.com', 'direct', 'bing.com', 'utm:newsletter', 'claude.ai' };
    String[] pages = new String[]{ '/visualiser/saql', '/introduction', '/interview-questions', '/certification', '/visualiser/recipe', '/pro', '/curriculum', '/visualiser/dataflow' };
    String[] locales = new String[]{ 'en', 'hi', 'es', 'de', 'pt', 'ja', 'fr', 'ar' };
    String[] stages = new String[]{ 'lead', 'lead', 'lead', 'lead', 'mql', 'mql', 'mql', 'sql', 'sql', 'opportunity' };
    List<Lead> leads = new List<Lead>();
    for (Integer i = 0; i < 20; i++) {
        Boolean sales = Math.mod(i, 3) == 0;
        String stage = stages[Math.mod(i, stages.size())];
        Integer lessons = Math.mod(i * 7, 9);
        leads.add(new Lead(
            FirstName = first[i], LastName = last[i], Email = first[i].toLowerCase() + '.' + last[i].toLowerCase() + '@example.com',
            Company = sales ? last[i] + ' Analytics' : first[i] + ' ' + last[i] + ' (self-serve)',
            Title = sales ? 'Head of RevOps' : 'Analyst', LeadSource = 'Web',
            Status = stage == 'sql' || stage == 'opportunity' ? 'Working - Contacted' : 'Open - Not Contacted',
            Lifecycle_Stage__c = stage, Motion__c = sales ? 'sales-led' : 'self-serve',
            Academy_Interest__c = sales ? (Math.mod(i, 2) == 0 ? 'seats' : 'salesforce-setup') : null,
            Seats_Requested__c = sales ? 5 + Math.mod(i * 11, 60) : null,
            Org_Type__c = sales ? (Math.mod(i, 2) == 0 ? 'company' : 'university') : null,
            Traffic_Source__c = sources[Math.mod(i, sources.size())], First_Landing_Page__c = pages[Math.mod(i, pages.size())],
            Landing_Page__c = sales ? '/pro' : null, Views_Before_Lead__c = 2 + Math.mod(i * 5, 30),
            Academy_Lessons_Done__c = lessons, Academy_Points__c = lessons * 10 + Math.mod(i, 4) * 6,
            Academy_Locale__c = locales[Math.mod(i, locales.size())], Academy_User_Id__c = 'demo-funnel-' + i,
            Signup_Date__c = Date.today().addDays(-Math.mod(i * 3, 40)),
            Description = 'Academy demo funnel lead.'));
    }
    Database.insert(leads, o);

    // --- Self-serve customers: Pro bought with points, month by month --------------
    Pricebook2 std = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1];
    Integer[] months = new Integer[]{ 5, 3, 2, 1, 4, 2 };
    Integer[] daysLeft = new Integer[]{ 22, 9, 3, 27, -12, 15 };
    List<Account> customers = new List<Account>();
    for (Integer i = 0; i < 6; i++) {
        Boolean churned = daysLeft[i] < 0;
        customers.add(new Account(
            Name = first[i] + ' ' + last[i] + ' (self-serve)', Website = 'https://example.com/selfserve-' + (i + 1),
            Lifecycle_Stage__c = churned ? 'churned' : 'customer', Motion__c = 'self-serve', Academy_Plan__c = churned ? 'free' : 'pro',
            MRR__c = churned ? 0 : 12, Customer_Since__c = Date.today().addMonths(-months[i]), Pro_Until__c = Date.today().addDays(daysLeft[i]),
            Points_Spent__c = months[i] * 1000, Org_Type__c = null, Description = 'Academy demo self-serve customer.'));
    }
    Database.insert(customers, o);
    List<Contact> buyers = new List<Contact>();
    List<Opportunity> pro = new List<Opportunity>();
    for (Integer i = 0; i < 6; i++) {
        Account a = customers[i];
        buyers.add(new Contact(AccountId = a.Id, FirstName = first[i], LastName = last[i], Email = first[i].toLowerCase() + '.pro@example.com',
            Academy_User_Id__c = 'demo-pro-' + i, Academy_Points__c = 100 + i * 40, Is_Pro__c = a.Lifecycle_Stage__c == 'customer',
            Lifecycle_Stage__c = a.Lifecycle_Stage__c, Motion__c = 'self-serve'));
        for (Integer m = 0; m < months[i]; m++) {
            pro.add(new Opportunity(AccountId = a.Id, Name = m == 0 ? 'Pro — self-serve (first month)' : 'Pro — self-serve renewal',
                StageName = 'Closed Won', CloseDate = a.Customer_Since__c.addMonths(m), Amount = 12, Seats__c = 1,
                Paid_In__c = 'points', Points_Amount__c = 1000, LeadSource = 'Web', Description = 'Academy demo Pro month.'));
        }
    }
    Database.insert(buyers, o);
    Database.insert(pro, o);

    // --- More members on Northwind's seats ------------------------------------------
    Account northwind = [SELECT Id, Seats_Used__c FROM Account WHERE Website = 'https://example.com/northwind' LIMIT 1];
    List<Contact> members = new List<Contact>();
    for (Integer i = 10; i < 18; i++) {
        members.add(new Contact(AccountId = northwind.Id, FirstName = first[i], LastName = last[i], Title = 'Consultant',
            Email = first[i].toLowerCase() + '.' + last[i].toLowerCase() + '@example.com', Is_Pro__c = true,
            Academy_Points__c = 40 + i * 9, Lifecycle_Stage__c = 'customer', Motion__c = 'sales-led', Academy_User_Id__c = 'demo-seat-' + i));
    }
    Database.insert(members, o);
    List<Seat_Assignment__c> seats = new List<Seat_Assignment__c>();
    for (Integer i = 0; i < members.size(); i++) {
        seats.add(new Seat_Assignment__c(Account__c = northwind.Id, Contact__c = members[i].Id, Role__c = 'member',
            Status__c = i == members.size() - 1 ? 'freed' : 'active', Joined_On__c = Date.today().addDays(-20 + i), Academy_User_Id__c = 'demo-seat-' + (i + 10)));
    }
    insert seats;
    northwind.Seats_Used__c = 10;
    update northwind;

    // --- Discovery meetings on sales-led leads ---------------------------------------
    List<Event> meetings = new List<Event>();
    Integer n = 0;
    for (Lead l : leads) {
        if (l.Motion__c != 'sales-led' || n >= 4) continue;
        meetings.add(new Event(WhoId = l.Id, Subject = 'Discovery call — seats and rollout', ActivityDateTime = Datetime.now().addDays(1 + n).addHours(2),
            DurationInMinutes = 30, Description = 'Who manages the seats, how many, start date, points or USD.'));
        n++;
    }
    insert meetings;

    // --- Support cases for the Service Console ----------------------------------------
    Contact nwAdmin = [SELECT Id, AccountId FROM Contact WHERE Email = 'priya.nair@example.com' LIMIT 1];
    List<Case> cases = new List<Case>{
        new Case(AccountId = northwind.Id, ContactId = nwAdmin.Id, Subject = 'Add 10 more seats before the next cohort', Origin = 'Web', Status = 'New', Priority = 'High', Description = 'Northwind is onboarding a new delivery squad on the 1st.'),
        new Case(AccountId = northwind.Id, ContactId = members[0].Id, Subject = 'Join code says every seat is taken', Origin = 'Email', Status = 'Working', Priority = 'High', Description = 'Seats were full before the extra 10 were added.'),
        new Case(AccountId = customers[1].Id, ContactId = buyers[1].Id, Subject = 'Pro lesson still locked after redeeming points', Origin = 'Web', Status = 'New', Priority = 'Medium', Description = 'Redeemed 1,000 points; the SAQL windowing lesson still shows the locked card.'),
        new Case(AccountId = customers[2].Id, ContactId = buyers[2].Id, Subject = 'Practice exam window closed by accident', Origin = 'Web', Status = 'Closed', Priority = 'Low', Description = 'Resumed from saved progress — explained the resume button.'),
        new Case(AccountId = customers[4].Id, ContactId = buyers[4].Id, Subject = 'Why did Pro end? I still have points', Origin = 'Email', Status = 'New', Priority = 'Medium', Description = 'Churned self-serve customer — balance is 420 points, Pro needs 1,000.'),
        new Case(AccountId = customers[0].Id, ContactId = buyers[0].Id, Subject = 'Hindi translation of a quiz option reads wrong', Origin = 'Web', Status = 'Working', Priority = 'Low', Description = 'Machine translation — fix the English source and re-run the build.')
    };
    Database.insert(cases, o);

    System.debug('Funnel seeded: ' + leads.size() + ' leads, ' + customers.size() + ' self-serve customers, ' + pro.size() + ' Pro deals, ' + members.size() + ' seat members, ' + meetings.size() + ' meetings, ' + cases.size() + ' cases.');
}
