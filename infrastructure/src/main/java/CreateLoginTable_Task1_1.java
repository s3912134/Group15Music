import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;

import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.*;

import java.util.Arrays;

public class CreateLoginTable_Task1_1 {
    public static void main(String[] args) {
        String studentId = "s3869994";
        String firstName = "Sanad";
        String lastName = "Kheder";
        String tableName = "login";  //table name


        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion("us-east-1").build(); //connect to us-east-1 Server

        DynamoDB dynamoDB = new DynamoDB(client);

        // Delete the table if it exists
        try {
            Table table = dynamoDB.getTable(tableName);
             table.delete();
            table.waitForDelete();
             System.out.println("Table deleted successfully!");
        }catch (Exception e) {
            System.out.println("Table does not exist or was already deleted.");
        }


               try {
            System.out.println("Attempting to create table; please wait...");
            Table table = dynamoDB.createTable(
                    tableName,Arrays.asList(new KeySchemaElement("email", KeyType.HASH) ),// Partition key
                    Arrays.asList(new AttributeDefinition("email", ScalarAttributeType.S)),
                       new ProvisionedThroughput(5L, 5L) );
            table.waitForActive();
            System.out.println("Table created successfully!");


            // Insert 10 entities
            for      (int i = 0; i < 10; i++) {
                String email = studentId + i + "@student.rmit.edu.au";
                String userName = firstName + lastName + i;
                String password = String.format("%d%d%d%d%d%d", i, (i + 1) % 10, (i + 2) % 10, (i + 3) % 10, (i + 4) % 10, (i + 5) % 10);
                table.putItem(new Item().withPrimaryKey("email", email).withString("user_name", userName).withString("password", password));
                System.out.println("Inserted: " + email + " | Password: " + password);
            }



                          }
        catch (Exception e)    {
            System.err.println("Error: " + e.getMessage());
        }
               }
}
