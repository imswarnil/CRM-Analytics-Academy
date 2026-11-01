@IsTest
private class AcademyLeadEventsTest {
    private static Lead event(String ev, String user) {
        return new Lead(LastName = 'Rao', FirstName = 'Asha', Company = 'Asha Rao (self-serve)', Email = 'asha@example.com',
            LeadSource = 'Web', Academy_Event__c = ev, Academy_User_Id__c = user);
    }

    private static void put(List<Lead> leads) {
        Database.DMLOptions o = new Database.DMLOptions();
        o.DuplicateRuleHeader.allowSave = true;
        Database.insert(leads, o);
    }

    @IsTest static void signupThenRedeemMakesASelfServeCustomer() {
        Test.startTest();
        put(new List<Lead>{ event('signup', 'u-1') });
        Test.stopTest();
        Lead l = [SELECT Lifecycle_Stage__c, Motion__c, IsConverted FROM Lead WHERE Academy_User_Id__c = 'u-1'];
        System.assertEquals('lead', l.Lifecycle_Stage__c);
        System.assertEquals('self-serve', l.Motion__c);

        Lead pay = event('redeem', 'u-1');
        put(new List<Lead>{ pay });
        AcademyLeadEvents.run(new Set<Id>{ pay.Id });

        Account a = [SELECT Lifecycle_Stage__c, Motion__c, MRR__c, Academy_Plan__c FROM Account LIMIT 1];
        System.assertEquals('customer', a.Lifecycle_Stage__c);
        System.assertEquals('self-serve', a.Motion__c);
        System.assertEquals(12, a.MRR__c);
        System.assertEquals(1, [SELECT COUNT() FROM Opportunity WHERE StageName = 'Closed Won']);
        System.assertEquals(0, [SELECT COUNT() FROM Lead WHERE Academy_User_Id__c = 'u-1' AND IsConverted = false]);

        Lead again = event('redeem', 'u-1');
        put(new List<Lead>{ again });
        AcademyLeadEvents.run(new Set<Id>{ again.Id });
        System.assertEquals(2, [SELECT COUNT() FROM Opportunity WHERE StageName = 'Closed Won']);
        System.assertEquals(2000, [SELECT Points_Spent__c FROM Account LIMIT 1].Points_Spent__c);
    }

    @IsTest static void packPurchaseMakesAUsageCustomer() {
        put(new List<Lead>{ event('signup', 'u-3') });
        Lead buy = event('pack', 'u-3');
        buy.Description = 'Bought 2 session pack(s): 20 sessions for 200 points (self-serve).';
        put(new List<Lead>{ buy });
        AcademyLeadEvents.run(new Set<Id>{ buy.Id });
        Account a = [SELECT Academy_Plan__c, Sessions_Bought__c, Points_Spent__c, Lifecycle_Stage__c FROM Account LIMIT 1];
        System.assertEquals('usage', a.Academy_Plan__c);
        System.assertEquals(20, a.Sessions_Bought__c);
        System.assertEquals(200, a.Points_Spent__c);
        System.assertEquals('customer', a.Lifecycle_Stage__c);
        System.assertEquals(200, [SELECT Amount FROM Opportunity LIMIT 1].Amount);
    }

    @IsTest static void stripeSubscriptionAndTeamBecomeRevenue() {
        Lead pro = event('subscribe', 'u-4');
        pro.Description = 'Purchase: proYearly · 150 USD · 1 seat(s) (subscribe).';
        put(new List<Lead>{ pro });
        AcademyLeadEvents.run(new Set<Id>{ pro.Id });
        Account a = [SELECT Academy_Plan__c, MRR__c, Lifecycle_Stage__c FROM Account LIMIT 1];
        System.assertEquals('pro', a.Academy_Plan__c);
        System.assertEquals(12.5, a.MRR__c);
        System.assertEquals(150, [SELECT Amount FROM Opportunity WHERE Name = 'Pro — yearly' LIMIT 1].Amount);

        Lead team = event('team', 'u-4');
        team.Description = 'Purchase: teamSeat · 50 USD · 5 seat(s) (team).';
        put(new List<Lead>{ team });
        AcademyLeadEvents.run(new Set<Id>{ team.Id });
        Account after = [SELECT Academy_Plan__c, Seats_Purchased__c, MRR__c FROM Account LIMIT 1];
        System.assertEquals('seats', after.Academy_Plan__c);
        System.assertEquals(5, after.Seats_Purchased__c);
        System.assertEquals(50, after.MRR__c);
    }

    @IsTest static void duplicateSignupIsRemovedAndRequestsStaySalesLed() {
        Lead first = event('signup', 'u-2');
        Lead dup = event('signup', 'u-2');
        Lead ask = event('request', 'u-2');
        put(new List<Lead>{ first, dup, ask });
        AcademyLeadEvents.run(new Set<Id>{ first.Id, dup.Id, ask.Id });
        System.assertEquals(2, [SELECT COUNT() FROM Lead WHERE Academy_User_Id__c = 'u-2']);
        System.assertEquals('sql', [SELECT Lifecycle_Stage__c FROM Lead WHERE Id = :ask.Id].Lifecycle_Stage__c);
    }
}
