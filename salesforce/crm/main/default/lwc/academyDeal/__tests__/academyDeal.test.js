import { createElement } from 'lwc';
import AcademyDeal from 'c/academyDeal';
import { getRecord } from 'lightning/uiRecordApi';

// The stub's getFieldValue returns nothing; read the UI API record shape for real.
jest.mock('lightning/uiRecordApi', () => {
    const actual = jest.requireActual('lightning/uiRecordApi');
    return {
        ...actual,
        getFieldValue: (record, field) => {
            const name = typeof field === 'string' ? field.split('.').pop() : field.fieldApiName;
            return record?.fields?.[name]?.value ?? null;
        }
    };
}, { virtual: true });

const record = (fields) => ({ fields: Object.fromEntries(Object.entries(fields).map(([k, value]) => [k, { value }])) });

function mount() {
    const el = createElement('c-academy-deal', { is: AcademyDeal });
    el.recordId = '006000000000001AAA';
    document.body.appendChild(el);
    return el;
}
const text = (el) => [...el.shadowRoot.querySelectorAll('.slds-text-heading_medium')].map((p) => p.textContent);

describe('c-academy-deal', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('shows seats, list value and the per-seat monthly price', async () => {
        const el = mount();
        getRecord.emit(record({ Seats__c: 10, Paid_In__c: 'usd', Points_Amount__c: null, Amount: 1200, StageName: 'Negotiation' }));
        await Promise.resolve();
        // 1200 a year over 10 seats is 10 a seat a month.
        expect(text(el)).toEqual(['10', '—', '$1,200', '$10.00']);
        expect(el.shadowRoot.querySelector('[slot="actions"]').textContent).toBe('Paid in USD');
    });

    it('explains the next step once the deal is won', async () => {
        const el = mount();
        getRecord.emit(record({ Seats__c: 5, Paid_In__c: 'points', Points_Amount__c: 5000, Amount: null, StageName: 'Closed Won' }));
        await Promise.resolve();
        expect(text(el)).toEqual(['5', '5,000', '—', '—']);
        expect(el.shadowRoot.textContent).toContain('join code');
    });
});
