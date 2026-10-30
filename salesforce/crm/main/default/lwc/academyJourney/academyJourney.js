import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

/**
 * Where a person is in the Academy's go-to-market: the lifecycle path
 * (Lead → MQL → SQL → Opportunity → Customer), the motion (self-serve or
 * sales-led) and — on leads — score, grade and how they found the site.
 * Reads the record through Lightning Data Service: no Apex, no extra API use.
 */
const STAGES = [
    { value: 'lead', label: 'Lead' },
    { value: 'mql', label: 'MQL' },
    { value: 'sql', label: 'SQL' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'customer', label: 'Customer' }
];
const LEAD_EXTRA = ['Lead_Score__c', 'Lead_Grade__c', 'Traffic_Source__c', 'First_Landing_Page__c', 'Landing_Page__c', 'Views_Before_Lead__c', 'Academy_Lessons_Done__c', 'Academy_Interest__c', 'Seats_Requested__c'];

export default class AcademyJourney extends LightningElement {
    @api recordId;
    @api objectApiName;
    record;
    error;

    get fields() {
        const o = this.objectApiName;
        const base = [`${o}.Lifecycle_Stage__c`, `${o}.Motion__c`];
        return o === 'Lead' ? base.concat(LEAD_EXTRA.map((f) => `Lead.${f}`)) : base;
    }

    @wire(getRecord, { recordId: '$recordId', optionalFields: '$fields' })
    wired({ data, error }) {
        this.record = data;
        this.error = error;
    }

    value(field) {
        return this.record ? getFieldValue(this.record, `${this.objectApiName}.${field}`) : null;
    }

    get stage() { return this.value('Lifecycle_Stage__c'); }
    get churned() { return this.stage === 'churned'; }
    get steps() {
        const at = STAGES.findIndex((s) => s.value === this.stage);
        return STAGES.map((s, i) => {
            const state = i < at ? 'slds-is-complete' : i === at ? 'slds-is-current slds-is-active' : 'slds-is-incomplete';
            return { ...s, className: `slds-path__item ${state}` };
        });
    }
    get motion() { return this.value('Motion__c'); }
    get motionLabel() { return this.motion === 'self-serve' ? 'Self-serve' : this.motion === 'sales-led' ? 'Sales-led' : 'Motion not set'; }
    get motionClass() { return `slds-badge ${this.motion === 'self-serve' ? 'slds-theme_success' : this.motion === 'sales-led' ? 'slds-badge_inverse' : ''}`; }

    get isLead() { return this.objectApiName === 'Lead'; }
    get score() { return this.value('Lead_Score__c') ?? 0; }
    get grade() { return this.value('Lead_Grade__c') ?? '—'; }
    get gradeClass() { return `slds-badge ${this.grade === 'Hot' ? 'slds-theme_error' : this.grade === 'Warm' ? 'slds-theme_warning' : ''}`; }
    get facts() {
        if (!this.isLead) return [];
        const f = [
            ['First came from', this.value('Traffic_Source__c')],
            ['First page', this.value('First_Landing_Page__c')],
            ['Asked from', this.value('Landing_Page__c')],
            ['Pages read before asking', this.value('Views_Before_Lead__c')],
            ['Lessons done', this.value('Academy_Lessons_Done__c')],
            ['Asked for', this.value('Academy_Interest__c')],
            ['Seats requested', this.value('Seats_Requested__c')]
        ];
        return f.filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, v]) => ({ label, value: String(v) }));
    }
    get hasFacts() { return this.facts.length > 0; }
}
