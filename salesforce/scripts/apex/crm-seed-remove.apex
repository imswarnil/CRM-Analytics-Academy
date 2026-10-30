// Removes the Academy CRM demo data (everything tagged "[academy-demo]") and
// the Academy Points price book. Products are deactivated, not deleted, in
// case a real deal already uses them. One anonymous Apex run.
//
//   sf apex run --file scripts/apex/crm-seed-remove.apex --target-org crma-learning

delete [SELECT Id FROM Task WHERE Description LIKE '%[academy-demo]%'];
delete [SELECT Id FROM Opportunity WHERE Description LIKE '%[academy-demo]%'];
delete [SELECT Id FROM Contact WHERE Description LIKE '%[academy-demo]%'];
delete [SELECT Id FROM Lead WHERE Description LIKE '%[academy-demo]%' AND IsConverted = false];
delete [SELECT Id FROM Account WHERE Description LIKE '%[academy-demo]%'];
delete [SELECT Id FROM Pricebook2 WHERE Name = 'Academy Points'];
List<Product2> products = [SELECT Id FROM Product2 WHERE ProductCode LIKE 'ACAD-%'];
for (Product2 p : products) p.IsActive = false;
update products;
System.debug('Academy demo data removed.');
