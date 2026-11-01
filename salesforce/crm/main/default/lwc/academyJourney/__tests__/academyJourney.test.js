import { createElement } from 'lwc';
import AcademyJourney from 'c/academyJourney';
import { getRecord } from 'lightning/uiRecordApi';

jest.mock('lightning/uiRecordApi', () => {
    const actual = jest.requireActual('lightning/uiRecordApi');
    return {
        ...actual,
        getFieldValue: (record, field) => record?.fields?.[String(field).split('.').pop()]?.value ?? null
    };
}, { virtual: true });

const record = (fields) => ({ fields: Object.fromEntries(Object.entries(fields).map(([k, value]) => [k, { value }])) });

function mount(objectApiName) {
    const el = createElement('c-academy-journey', { is: AcademyJourney });
    el.recordId = '00Q000000000001AAA';
    el.objectApiName = objectApiName;
    document.body.appendChild(el);
    return el;
}

describe('c-academy-journey', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('marks the stages before the current one complete', async () => {
        const el = mount('Account');
        getRecord.emit(record({ Lifecycle_Stage__c: 'sql', Motion__c: 'sales-led' }));
        await Promise.resolve();
        const items = [...el.shadowRoot.querySelectorAll('.slds-path__item')].map((li) => li.className);
        expect(items).toHaveLength(5);
        expect(items[0]).toContain('slds-is-complete');
        expect(items[1]).toContain('slds-is-complete');
        expect(items[2]).toContain('slds-is-current');
        expect(items[3]).toContain('slds-is-incomplete');
        expect(el.shadowRoot.querySelector('[slot="actions"]').textContent).toBe('Sales-led');
    });

    it('lists only the lead facts that are filled in', async () => {
        const el = mount('Lead');
        getRecord.emit(record({ Lifecycle_Stage__c: 'lead', Motion__c: 'self-serve', Lead_Score__c: 70, Lead_Grade__c: 'Hot', Traffic_Source__c: 'utm:linkedin', Academy_Lessons_Done__c: 4 }));
        await Promise.resolve();
        const body = el.shadowRoot.textContent;
        expect(body).toContain('utm:linkedin');
        expect(body).toContain('Lessons done');
        expect(body).not.toContain('Seats requested');
    });
});
