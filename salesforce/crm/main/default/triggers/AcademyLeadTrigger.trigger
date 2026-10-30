/**
 * Leads the website posts by Web-to-Lead carry Academy_Event__c (signup,
 * redeem, request). After insert, one queued job applies them to the person's
 * existing record — see AcademyLeadEvents. Leads created by hand have no event
 * and are left alone.
 */
trigger AcademyLeadTrigger on Lead (after insert) {
    Set<Id> ids = new Set<Id>();
    for (Lead l : Trigger.new) {
        if (String.isNotBlank(l.Academy_Event__c) && String.isNotBlank(l.Academy_User_Id__c)) ids.add(l.Id);
    }
    if (!ids.isEmpty() && !System.isQueueable() && Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()) {
        System.enqueueJob(new AcademyLeadEvents(ids));
    }
}
