import { createElement } from 'lwc';
import AcademyPulse from 'c/academyPulse';
import get from '@salesforce/apex/AcademyPulse.get';

jest.mock(
    '@salesforce/apex/AcademyPulse.get',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createApexTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

const flush = () => Promise.resolve();

describe('c-academy-pulse', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('shows five tiles with formatted numbers', async () => {
        const el = createElement('c-academy-pulse', { is: AcademyPulse });
        document.body.appendChild(el);
        get.emit({ mrr: 1234, customers: 7, hotLeads: 3, seatPipeline: 5000, seatDeals: 2, leadsThisWeek: 11 });
        await flush();
        const tiles = el.shadowRoot.querySelectorAll('button.tile');
        expect(tiles.length).toBe(5);
        expect(tiles[0].textContent).toContain('$1,234');
        expect(tiles[0].textContent).toContain('ARR $14,808');
        expect(tiles[3].textContent).toContain('2 open deals');
    });

    it('explains a permission error', async () => {
        const el = createElement('c-academy-pulse', { is: AcademyPulse });
        document.body.appendChild(el);
        get.error();
        await flush();
        expect(el.shadowRoot.textContent).toContain('Academy CRM Access');
    });
});
