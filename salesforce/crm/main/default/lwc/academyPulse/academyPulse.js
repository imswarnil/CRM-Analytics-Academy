import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import get from '@salesforce/apex/AcademyPulse.get';

const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default class AcademyPulse extends NavigationMixin(LightningElement) {
    pulse;
    error;

    @wire(get)
    wired({ data, error }) {
        this.pulse = data;
        this.error = error;
    }

    get loading() {
        return !this.pulse && !this.error;
    }

    get tiles() {
        const p = this.pulse || {};
        return [
            { key: 'mrr', label: 'MRR', value: usd(p.mrr), hint: `ARR ${usd((p.mrr || 0) * 12)}`, icon: 'utility:moneybag', list: { object: 'Account', filter: 'Academy_Customers' } },
            { key: 'customers', label: 'Customers', value: p.customers || 0, hint: 'Paying accounts', icon: 'utility:company', list: { object: 'Account', filter: 'Academy_Customers' } },
            { key: 'hot', label: 'Hot leads', value: p.hotLeads || 0, hint: 'Score 60 or more', icon: 'utility:favorite', list: { object: 'Lead', filter: 'Academy_Hot_Leads' } },
            { key: 'pipe', label: 'Seat pipeline', value: usd(p.seatPipeline), hint: `${p.seatDeals || 0} open deals`, icon: 'utility:opportunity', list: { object: 'Opportunity', filter: 'Academy_Open_Seat_Deals' } },
            { key: 'week', label: 'New leads', value: p.leadsThisWeek || 0, hint: 'Last 7 days', icon: 'utility:trending', list: { object: 'Lead', filter: 'Academy_Self_Serve' } }
        ];
    }

    open(event) {
        const t = this.tiles.find((x) => x.key === event.currentTarget.dataset.key);
        if (!t) return;
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: { objectApiName: t.list.object, actionName: 'list' },
            state: { filterName: t.list.filter }
        });
    }
}
