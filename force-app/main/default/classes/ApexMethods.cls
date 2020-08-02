public class ApexMethods{

    @AuraEnabled
    public static User getUserInfo(){
        return [Select id, FirstName,LastName from User where id =: UserInfo.getUserId()];
    }

    @AuraEnabled
    public static List<Contact> getContactByUserId(String userId){
        return [select Name, Email from Contact where createdById =:userId];
    }

    @AuraEnabled
    public static List<Account> fetchAllAccounts(){
        return [select Name, AccountNumber from Account];
    }

    @AuraEnabled
    public static List<Contact> getContacts(){ 
        return [select Name, Id from Contact];
    }
}