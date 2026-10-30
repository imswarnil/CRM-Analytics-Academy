import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import SEATS from '@salesforce/schema/Opportunity.Seats__c';
import PAID_IN from '@salesforce/schema/Opportunity.Paid_In__c';
import POINTS from '@salesforce/schema/Opportunity.Points_Amount__c';
import AMOUNT from '@salesforce/schema/Opportunity.Amount';
import STAGE from '@salesforce/schema/Opportunity.StageName';

/**
 * An Academy deal in its own terms: seats, what it is paid in (points while
 * the Academy has no payments, USD later), the points value and the list value
 * per seat per month.
 */
const FIELDS = [SEATS, PAID_IN, POINTS, AMOUNT, STAGE];

export default class AcademyDeal extends LightningElement {
    @api recordId;
    record;

    @wire(getRecord, { recordId: '$recordId', optionalFields: FIELDS })
    wired({ data }) { this.record = data; }

    v(f) { return this.record ? getFieldValue(this.record, f) : null; }
    get seats() { return this.v(SEATS) ?? 0; }
    get paidIn() { return this.v(PAID_IN) === 'usd' ? 'USD' : 'Points'; }
    get paidClass() { return `slds-badge ${this.v(PAID_IN) === 'usd' ? 'slds-theme_success' : 'slds-badge_inverse'}`; }
    get points() { const p = this.v(POINTS); return p ? Number(p).toLocaleString('en-US') : '—'; }
    get amount() { const a = this.v(AMOUNT); return a === null || a === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(a); }
    get perSeat() {
        const a = this.v(AMOUNT);
        const s = this.seats;
        return a && s ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(a / s / 12) : '—';
    }
    get won() { return this.v(STAGE) === 'Closed Won'; }
}
