import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import CODE from '@salesforce/schema/Account.Join_Code__c';
import TERM from '@salesforce/schema/Account.Seat_Term_End__c';

/**
 * Who holds this organisation's seats: member, role, status, joined — and the
 * join code its admin hands out (members join at crmanalytics.imswarnil.com/team).
 */
export default class AcademySeats extends LightningElement {
    @api recordId;
    account;
    rows = [];
    error;

    @wire(getRecord, { recordId: '$recordId', optionalFields: [CODE, TERM] })
    wiredAccount({ data }) { this.account = data; }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Seat_Assignments__r',
        fields: ['Seat_Assignment__c.Name', 'Seat_Assignment__c.Contact__r.Name', 'Seat_Assignment__c.Status__c', 'Seat_Assignment__c.Role__c', 'Seat_Assignment__c.Joined_On__c'],
        sortBy: ['Seat_Assignment__c.Joined_On__c'],
        pageSize: 50
    })
    wiredSeats({ data, error }) {
        this.error = error;
        this.rows = (data?.records ?? []).map((r) => {
            const f = r.fields;
            const status = f.Status__c?.value;
            return {
                id: r.id,
                name: f.Name?.value,
                member: f.Contact__r?.displayValue ?? f.Contact__r?.value?.fields?.Name?.value ?? '—',
                role: f.Role__c?.value === 'admin' ? 'Admin' : 'Member',
                joined: f.Joined_On__c?.value ?? '—',
                statusLabel: status === 'active' ? 'Active' : 'Freed',
                statusClass: `slds-badge ${status === 'active' ? 'slds-theme_success' : ''}`
            };
        });
    }

    get code() { return this.account ? getFieldValue(this.account, CODE) : null; }
    get term() { return this.account ? getFieldValue(this.account, TERM) : null; }
    get joinLink() { return this.code ? `https://crmanalytics.imswarnil.com/team?code=${this.code}` : null; }
    get hasRows() { return this.rows.length > 0; }
    get title() { return `Academy seats (${this.rows.filter((r) => r.statusLabel === 'Active').length} active)`; }
}
