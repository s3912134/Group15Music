import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.*;

import java.util.Arrays;

public class CreateSubscriptionsTable {

    public static void main(String[] args) throws Exception {

        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion("us-east-1") // Change region if needed
                .build();

        DynamoDB dynamoDB = new DynamoDB(client);

        String tableName = "subscriptions";

        try {
            System.out.println("Creating subscriptions table...");

            CreateTableRequest request = new CreateTableRequest()
                    .withTableName(tableName)
                    .withKeySchema(
                            new KeySchemaElement("user_email", KeyType.HASH),
                            new KeySchemaElement("song_title", KeyType.RANGE)
                    )
                    .withAttributeDefinitions(
                            new AttributeDefinition("user_email", ScalarAttributeType.S),
                            new AttributeDefinition("song_title", ScalarAttributeType.S),
                            new AttributeDefinition("song_key", ScalarAttributeType.S) // For GSI
                    )
                    .withProvisionedThroughput(new ProvisionedThroughput(5L, 5L))
                    .withGlobalSecondaryIndexes(
                            new GlobalSecondaryIndex()
                                    .withIndexName("SongKeyIndex")
                                    .withKeySchema(
                                            new KeySchemaElement("song_key", KeyType.HASH)
                                    )
                                    .withProjection(new Projection().withProjectionType(ProjectionType.ALL))
                                    .withProvisionedThroughput(new ProvisionedThroughput(5L, 5L))
                    );

            Table table = dynamoDB.createTable(request);
            table.waitForActive();
            System.out.println("Table created successfully. Status: " + table.getDescription().getTableStatus());

        } catch (Exception e) {
            System.err.println("Error creating table:");
            System.err.println(e.getMessage());
        }
    }
}
