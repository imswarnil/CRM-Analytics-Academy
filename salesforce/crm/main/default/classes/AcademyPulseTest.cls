@IsTest
private class AcademyPulseTest {
    @IsTest static void countsTheHomePageNumbers() {
        Account a = new Account(Name = 'Pulse Co', Lifecycle_Stage__c = 'customer', MRR__c = 49);
        insert a;
        insert new Opportunity(AccountId = a.Id, Name = 'Team — 10 seats', StageName = 'Prospecting', CloseDate = Date.today().addDays(30), Amount = 1000, Seats__c = 10);
        insert new Lead(LastName = 'Rao', Company = 'Pulse Co', Email = 'pulse@example.com');
        AcademyPulse.Pulse p = AcademyPulse.get();
        System.assertEquals(49, p.mrr);
        System.assertEquals(1, p.customers);
        System.assertEquals(1000, p.seatPipeline);
        System.assertEquals(1, p.seatDeals);
        System.assertEquals(1, p.leadsThisWeek);
    }
}
