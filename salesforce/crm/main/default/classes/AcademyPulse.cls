/**
 * The numbers on the Academy Sales home page, in one cacheable call:
 * recurring revenue, customers, hot leads, the open seat pipeline and
 * leads this week. Read-only; respects the user's sharing.
 */
public with sharing class AcademyPulse {
    public class Pulse {
        @AuraEnabled public Decimal mrr = 0;
        @AuraEnabled public Integer customers = 0;
        @AuraEnabled public Integer hotLeads = 0;
        @AuraEnabled public Decimal seatPipeline = 0;
        @AuraEnabled public Integer seatDeals = 0;
        @AuraEnabled public Integer leadsThisWeek = 0;
    }

    @AuraEnabled(cacheable=true)
    public static Pulse get() {
        Pulse p = new Pulse();
        AggregateResult rev = [SELECT SUM(MRR__c) mrr, COUNT(Id) n FROM Account WHERE Lifecycle_Stage__c = 'customer' WITH USER_MODE];
        p.mrr = rev.get('mrr') == null ? 0 : (Decimal) rev.get('mrr');
        p.customers = (Integer) rev.get('n');
        p.hotLeads = [SELECT COUNT() FROM Lead WHERE IsConverted = false AND Lead_Score__c >= 60 AND Status != 'Closed - Not Converted' WITH USER_MODE];
        AggregateResult pipe = [SELECT SUM(Amount) amt, COUNT(Id) n FROM Opportunity WHERE IsClosed = false AND Seats__c != null WITH USER_MODE];
        p.seatPipeline = pipe.get('amt') == null ? 0 : (Decimal) pipe.get('amt');
        p.seatDeals = (Integer) pipe.get('n');
        p.leadsThisWeek = [SELECT COUNT() FROM Lead WHERE CreatedDate = LAST_N_DAYS:7 WITH USER_MODE];
        return p;
    }
}
