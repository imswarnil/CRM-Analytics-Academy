/**
 * Applies the website's events to one record per person.
 *
 * The site can only create Leads (Web-to-Lead: no login, nothing that can lock
 * a user), so every event arrives as a new Lead with Academy_Event__c and the
 * person's Academy_User_Id__c. This job folds each one into the person's
 * existing record and deletes the duplicate:
 *
 *   signup   → the person's lead: Lifecycle = Lead, Motion = Self-serve.
 *              The first sign-up lead IS that record; later ones are merged.
 *   pack     → they bought a session pack with points (usage-based; the
 *              Academy never takes money): their lead is converted to a
 *              self-serve customer — Account (Customer, Self-serve, Plan
 *              Usage, Points spent, Sessions bought, Customer since), Contact,
 *              and a Closed Won deal valued in points. An existing customer
 *              gets another deal and the running totals go up.
 *   redeem   → the retired Pro purchase; handled like a pack of one month.
 *   request  → a seats / set-up / consulting request: sales-led. Kept as its
 *              own lead (it is a sales conversation), marked Lifecycle = SQL
 *              and linked by user id.
 */
public without sharing class AcademyLeadEvents implements Queueable {
    public static final Decimal PRO_MRR = 12;
    public static final Integer PRO_POINTS = 1000;
    public static final Integer PRO_DAYS = 30;
    public static final Integer PACK_POINTS = 100;
    public static final Integer PACK_SESSIONS = 10;

    /** What one purchase event bought: points spent and sessions, read from the lead's description. */
    public class Purchase {
        public Integer points;
        public Integer sessions;
        public Boolean pack;
        Purchase(Lead e) {
            pack = e.Academy_Event__c == 'pack';
            points = pack ? PACK_POINTS : PRO_POINTS;
            sessions = pack ? PACK_SESSIONS : 0;
            String d = e.Description == null ? '' : e.Description;
            Matcher m = Pattern.compile('(\\d+) sessions for (\\d+) points').matcher(d);
            if (pack && m.find()) {
                sessions = Integer.valueOf(m.group(1));
                points = Integer.valueOf(m.group(2));
            }
        }
    }

    private final Set<Id> leadIds;
    public AcademyLeadEvents(Set<Id> leadIds) { this.leadIds = leadIds; }

    public void execute(QueueableContext ctx) { run(leadIds); }

    public static void run(Set<Id> ids) {
        List<Lead> incoming = [
            SELECT Id, FirstName, LastName, Email, Company, Description, Academy_Event__c, Academy_User_Id__c, Academy_Points__c,
                   Academy_Lessons_Done__c, Traffic_Source__c, First_Landing_Page__c, CreatedDate
            FROM Lead WHERE Id IN :ids AND IsConverted = false ORDER BY CreatedDate, Id];
        Set<String> users = new Set<String>();
        for (Lead l : incoming) users.add(l.Academy_User_Id__c);

        // The person's oldest open lead (not a request) and any contact, per user id.
        Map<String, Lead> primary = new Map<String, Lead>();
        for (Lead l : [SELECT Id, Academy_User_Id__c, Academy_Event__c, Company, Email, FirstName, LastName, OwnerId
                       FROM Lead WHERE Academy_User_Id__c IN :users AND IsConverted = false
                       AND (Academy_Event__c = null OR Academy_Event__c != 'request') ORDER BY CreatedDate, Id]) {
            if (!primary.containsKey(l.Academy_User_Id__c)) primary.put(l.Academy_User_Id__c, l);
        }
        Map<String, Contact> contacts = new Map<String, Contact>();
        for (Contact c : [SELECT Id, AccountId, Academy_User_Id__c FROM Contact WHERE Academy_User_Id__c IN :users]) {
            contacts.put(c.Academy_User_Id__c, c);
        }

        List<Lead> leadUpdates = new List<Lead>();
        List<Lead> toDelete = new List<Lead>();
        List<Lead> toConvert = new List<Lead>();
        Map<Id, List<Purchase>> renewals = new Map<Id, List<Purchase>>(); // contact AccountId → purchases
        Map<Id, Purchase> firstBuy = new Map<Id, Purchase>(); // lead to convert → its purchase

        for (Lead e : incoming) {
            String ev = e.Academy_Event__c;
            Lead home = primary.get(e.Academy_User_Id__c);
            Contact c = contacts.get(e.Academy_User_Id__c);

            if (ev == 'request') {
                leadUpdates.add(new Lead(Id = e.Id, Lifecycle_Stage__c = 'sql', Motion__c = 'sales-led'));
                continue;
            }
            if (ev == 'signup') {
                if (c != null || (home != null && home.Id != e.Id)) {
                    toDelete.add(new Lead(Id = e.Id)); // already known
                } else {
                    leadUpdates.add(new Lead(Id = e.Id, Lifecycle_Stage__c = 'lead', Motion__c = 'self-serve', Signup_Date__c = Date.today()));
                }
                continue;
            }
            if (ev == 'redeem' || ev == 'pack') {
                Purchase buy = new Purchase(e);
                if (c != null && c.AccountId != null) {
                    if (!renewals.containsKey(c.AccountId)) renewals.put(c.AccountId, new List<Purchase>());
                    renewals.get(c.AccountId).add(buy);
                    toDelete.add(new Lead(Id = e.Id));
                    if (home != null && home.Id != e.Id) toDelete.add(new Lead(Id = home.Id));
                } else {
                    Lead target = home != null ? home : e;
                    toConvert.add(target);
                    firstBuy.put(target.Id, buy);
                    if (target.Id != e.Id) toDelete.add(new Lead(Id = e.Id));
                    primary.put(e.Academy_User_Id__c, target);
                }
            }
        }

        save(leadUpdates, false);
        convertToCustomers(toConvert, firstBuy);
        renew(renewals);
        if (!toDelete.isEmpty()) delete dedupe(toDelete);
    }

    // The org's duplicate rules alert on the same person twice — which is
    // exactly what this job reconciles — so its writes allow the save.
    private static Database.DMLOptions allowDuplicates() {
        Database.DMLOptions o = new Database.DMLOptions();
        o.DuplicateRuleHeader.allowSave = true;
        return o;
    }
    private static void save(List<SObject> rows, Boolean isInsert) {
        if (rows.isEmpty()) return;
        List<Database.SaveResult> results = isInsert ? Database.insert(rows, allowDuplicates()) : Database.update(rows, allowDuplicates());
        for (Database.SaveResult r : results) if (!r.isSuccess()) System.debug(LoggingLevel.WARN, 'Academy save failed: ' + r.getErrors());
    }

    private static List<Lead> dedupe(List<Lead> leads) {
        Map<Id, Lead> byId = new Map<Id, Lead>();
        for (Lead l : leads) byId.put(l.Id, l);
        return byId.values();
    }

    private static void convertToCustomers(List<Lead> leads, Map<Id, Purchase> buys) {
        if (leads.isEmpty()) return;
        String status = [SELECT MasterLabel FROM LeadStatus WHERE IsConverted = true LIMIT 1].MasterLabel;
        List<Database.LeadConvert> converts = new List<Database.LeadConvert>();
        Map<Id, String> userOf = new Map<Id, String>();
        for (Lead l : dedupe(leads)) userOf.put(l.Id, l.Academy_User_Id__c);
        for (Lead l : dedupe(leads)) {
            Database.LeadConvert lc = new Database.LeadConvert();
            lc.setLeadId(l.Id);
            lc.setConvertedStatus(status);
            lc.setDoNotCreateOpportunity(true);
            converts.add(lc);
        }
        List<Account> accounts = new List<Account>();
        List<Contact> people = new List<Contact>();
        List<Opportunity> deals = new List<Opportunity>();
        Database.DMLOptions opts = allowDuplicates();
        opts.OptAllOrNone = false;
        for (Database.LeadConvertResult r : Database.convertLead(converts, opts)) {
            if (!r.isSuccess()) {
                System.debug(LoggingLevel.WARN, 'Academy convert failed: ' + r.getErrors());
                continue;
            }
            Purchase buy = buys.get(r.getLeadId());
            Account a = new Account(Id = r.getAccountId(), Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve',
                Customer_Since__c = Date.today(), Points_Spent__c = buy.points);
            if (buy.pack) {
                a.Academy_Plan__c = 'usage';
                a.Sessions_Bought__c = buy.sessions;
            } else {
                a.Academy_Plan__c = 'pro';
                a.MRR__c = PRO_MRR;
                a.Pro_Until__c = Date.today().addDays(PRO_DAYS);
            }
            accounts.add(a);
            // Custom lead fields do not carry over on conversion unless mapped in
            // Setup, so the user id — which renewals find the person by — is set here.
            people.add(new Contact(Id = r.getContactId(), Academy_User_Id__c = userOf.get(r.getLeadId()), Is_Pro__c = true,
                Lifecycle_Stage__c = 'customer', Motion__c = 'self-serve'));
            deals.add(deal(r.getAccountId(), buy, true));
        }
        save(accounts, false);
        save(people, false);
        save(deals, true);
    }

    private static void renew(Map<Id, List<Purchase>> purchases) {
        if (purchases.isEmpty()) return;
        List<Account> accounts = [SELECT Id, Pro_Until__c, Points_Spent__c, Sessions_Bought__c, Customer_Since__c, MRR__c FROM Account WHERE Id IN :purchases.keySet()];
        List<Opportunity> deals = new List<Opportunity>();
        for (Account a : accounts) {
            for (Purchase buy : purchases.get(a.Id)) {
                a.Points_Spent__c = (a.Points_Spent__c == null ? 0 : a.Points_Spent__c) + buy.points;
                if (buy.pack) {
                    a.Sessions_Bought__c = (a.Sessions_Bought__c == null ? 0 : a.Sessions_Bought__c) + buy.sessions;
                    a.Academy_Plan__c = 'usage';
                } else {
                    Date startFrom = a.Pro_Until__c != null && a.Pro_Until__c > Date.today() ? a.Pro_Until__c : Date.today();
                    a.Pro_Until__c = startFrom.addDays(PRO_DAYS);
                    a.Academy_Plan__c = 'pro';
                    if (a.MRR__c == null || a.MRR__c < PRO_MRR) a.MRR__c = PRO_MRR;
                }
                deals.add(deal(a.Id, buy, false));
            }
            a.Lifecycle_Stage__c = 'customer';
            if (a.Customer_Since__c == null) a.Customer_Since__c = Date.today();
        }
        save(accounts, false);
        save(deals, true);
    }

    private static Opportunity deal(Id accountId, Purchase buy, Boolean first) {
        if (!buy.pack) return proDeal(accountId, first ? 'Pro — self-serve (first month)' : 'Pro — self-serve renewal');
        // Valued in points — the Academy never takes money; Amount carries the points.
        return new Opportunity(AccountId = accountId, Name = 'Session pack — ' + buy.sessions + ' sessions', StageName = 'Closed Won',
            CloseDate = Date.today(), Amount = buy.points, Paid_In__c = 'points', Points_Amount__c = buy.points, LeadSource = 'Web',
            Description = 'Bought on the site with points: ' + buy.sessions + ' sessions for ' + buy.points + ' points.');
    }

    private static Opportunity proDeal(Id accountId, String name) {
        return new Opportunity(AccountId = accountId, Name = name, StageName = 'Closed Won', CloseDate = Date.today(),
            Amount = PRO_MRR, Paid_In__c = 'points', Points_Amount__c = PRO_POINTS, Seats__c = 1, LeadSource = 'Web',
            Description = 'Bought on the site with points. Amount = list price of one Pro month.');
    }
}
