import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import MRR from '@salesforce/schema/Account.MRR__c';
import ARR from '@salesforce/schema/Account.ARR__c';
import POINTS from '@salesforce/schema/Account.Points_Spent__c';
import PRO_UNTIL from '@salesforce/schema/Account.Pro_Until__c';
import SINCE from '@salesforce/schema/Account.Customer_Since__c';
import PLAN from '@salesforce/schema/Account.Academy_Plan__c';
import SEATS from '@salesforce/schema/Account.Seats_Purchased__c';
import ACTIVE from '@salesforce/schema/Account.Active_Seats__c';

/**
 * The account's revenue at a glance: MRR and ARR (list price — paid in points
 * while the Academy has no payments), points spent, days of Pro left, and
 * seats used against seats bought.
 */
const FIELDS = [MRR, ARR, POINTS, PRO_UNTIL, SINCE, PLAN, SEATS, ACTIVE];
const money = (n) => (n === null || n === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n));

export default class AcademyRevenue extends LightningElement {
    @api recordId;
    record;
    error;

    @wire(getRecord, { recordId: '$recordId', optionalFields: FIELDS })
    wired({ data, error }) {
        this.record = data;
        this.error = error;
    }

    v(f) { return this.record ? getFieldValue(this.record, f) : null; }
    get mrr() { return money(this.v(MRR)); }
    get arr() { return money(this.v(ARR)); }
    get points() { const p = this.v(POINTS); return p ? Number(p).toLocaleString('en-US') : '0'; }
    get plan() { return { free: 'Free', pro: 'Pro', seats: 'Seats' }[this.v(PLAN)] ?? '—'; }
    get since() { return this.v(SINCE) ?? '—'; }
    get daysLeft() {
        const u = this.v(PRO_UNTIL);
        if (!u) return null;
        return Math.ceil((new Date(`${u}T00:00:00`) - new Date()) / 86400000);
    }
    get proText() {
        const d = this.daysLeft;
        if (d === null) return 'No self-serve Pro';
        return d >= 0 ? `${d} days of Pro left` : `Pro ended ${-d} days ago`;
    }
    get proClass() { const d = this.daysLeft; return `slds-badge ${d === null ? '' : d < 0 ? 'slds-theme_error' : d <= 7 ? 'slds-theme_warning' : 'slds-theme_success'}`; }
    get seats() { return this.v(SEATS) ?? 0; }
    get active() { return this.v(ACTIVE) ?? 0; }
    get hasSeats() { return this.seats > 0; }
    get seatPct() { return this.seats ? Math.min(100, Math.round((this.active / this.seats) * 100)) : 0; }
    get seatHint() { return this.seatPct >= 90 ? 'Nearly full — offer more seats.' : this.seatPct <= 40 ? 'Under half used — help them roll out.' : ''; }
}
