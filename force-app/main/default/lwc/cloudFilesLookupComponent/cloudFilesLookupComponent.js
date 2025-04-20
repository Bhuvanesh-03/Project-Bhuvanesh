import { LightningElement, api, track } from 'lwc';
import getAccounts from '@salesforce/apex/LookupController.getAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CloudFilesLookupComponent extends LightningElement {
    @api accountIds = [];
    @api selectedAccountId;
    @api label;
    @track filteredAccounts = [];
    @track selectedAccount = null;
    @track searchTerm = '';
    @track accounts = [];
    @track displayAsHyperLink = true;
    
    connectedCallback() {
        if (!this.label) this.label = 'Select Account';
        this.fetchAccounts();
    }

    async fetchAccounts() {
        try {
            const result = await getAccounts({ accountIds: this.accountIds });
            if (result && result.length > 0) {
                // this.accounts = result.map(acc => ({
                //     ...acc,
                //     recordLink: `/lightning/r/Account/${acc.Id}/view`
                // }));
                this.accounts = result;
                this.selectedAccount = this.accounts[0];
                this.selectedAccountId = this.accounts[0].Id;
                this.filteredAccounts = this.accounts.slice(1);
            }
        } catch (error) {
            this.showToast('Error', 'Error fetching accounts', 'error');
        }
    }

    handleInputChange(event) {
        this.searchTerm = event.target.value;
       
        this.filteredAccounts = this.accounts.filter(acc => 
            acc.Name && acc.Name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
       
        if (this.searchTerm.length > 2) {
            if (!this.filteredAccounts.length) this.searchAccounts();
        } 
    }

    async searchAccounts() {
        try {
            const result = await getAccounts({ searchTerm: this.searchTerm });
            this.filteredAccounts = [...result];
        } catch (error) {
            this.showToast('Error', 'Error searching accounts', 'error');
        }
    }

    handleSelect(event) {
        const accountId = event.currentTarget.dataset.id;
        this.selectedAccount = this.filteredAccounts.find(acc => acc.Id === accountId);
        this.selectedAccountId = this.selectedAccount.Id;
        this.filteredAccounts = this.accounts.filter(acc => acc.Id !== this.selectedAccountId);
    }

    handleRemoveSelection() {
        this.displayAsHyperLink = false;
        this.selectedAccount = null;
        this.selectedAccountId = null;
        this.searchTerm = '';
        this.accounts = [];
        this.filteredAccounts = [];
        setTimeout(() => {
            let inputElement = this.template.querySelector('lightning-input');
            if (inputElement) {
                inputElement.focus();
            }
        }, 0);
    }
    handleClick(event) {
        console.log('handleClick', event.currentTarget.dataset.id);
        this.handleSelect(event);
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
            })
        );
    }

    get dropdownClass() {
        return this.filteredAccounts.length >= 5 
            ? 'slds-dropdown slds-dropdown_left scrollable-dropdown' 
            : 'slds-dropdown slds-dropdown_left';
    }

    get dropdownStyle() {
        let containerWidth = 200; 
    
        const comboboxElement = this.template.querySelector('.slds-combobox');
        if (comboboxElement) {
            containerWidth = comboboxElement.getBoundingClientRect().width;
        }
    
        return `min-width: ${containerWidth}px; width: ${containerWidth}px; max-width: 350px;`;
    }
}