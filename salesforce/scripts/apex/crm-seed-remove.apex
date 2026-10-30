// Removes the Academy CRM demo data and the Academy Points price book.
// Demo accounts have a Website on example.com and demo people an
// @example.com email (Description cannot be filtered in SOQL). Deleting
// leads, contacts and accounts deletes their tasks, opportunities and seat
// assignments with them. Products are deactivated, not deleted, in case a
// real deal already uses them. One anonymous Apex run.
//
//   sf apex run --file scripts/apex/crm-seed-remove.apex --target-org crma-learning

delete [SELECT Id FROM Opportunity WHERE Account.Website LIKE 'https://example.com/%'];
delete [SELECT Id FROM Contact WHERE Email LIKE '%@example.com'];
delete [SELECT Id FROM Lead WHERE Email LIKE '%@example.com' AND IsConverted = false];
delete [SELECT Id FROM Account WHERE Website LIKE 'https://example.com/%'];
delete [SELECT Id FROM Pricebook2 WHERE Name = 'Academy Points'];
List<Product2> products = [SELECT Id FROM Product2 WHERE ProductCode LIKE 'ACAD-%'];
for (Product2 p : products) p.IsActive = false;
update products;
System.debug('Academy demo data removed.');
