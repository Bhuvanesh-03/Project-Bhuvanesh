public with sharing class LookupController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(List<Id> accountIds, String searchTerm) {   
        if (searchTerm != null && searchTerm.length() > 2) {
            System.debug('Executed during runtime!');
            return [SELECT Id, Name FROM Account WHERE Name LIKE :('%' +searchTerm + '%') LIMIT 50];
        }else if (accountIds != null && accountIds.size() > 0) {
            System.debug('Executed during Component Load!');
            return [SELECT Id, Name FROM Account WHERE Id IN :accountIds];
        }
        return new List<Account>();
    }
    
}