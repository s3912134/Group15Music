import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.*;

import java.util.Arrays;

public class MusicCreateTable_Task1_2 {

    public static void main(String[] args) throws Exception {

        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion("us-east-1")
                .build();

        DynamoDB dynamoDB = new DynamoDB(client);
        String tableName = "music";

        try {
            System.out.println("Attempting to create table; please wait...");

            CreateTableRequest request = new CreateTableRequest()
                    .withTableName(tableName)
                    .withKeySchema(
                            new KeySchemaElement("title", KeyType.HASH),
                            new KeySchemaElement("artist", KeyType.RANGE)
                    )
                    .withAttributeDefinitions(
                            new AttributeDefinition("title", ScalarAttributeType.S),
                            new AttributeDefinition("artist", ScalarAttributeType.S),
                            new AttributeDefinition("album", ScalarAttributeType.S)  // GSI field
                    )
                    .withProvisionedThroughput(new ProvisionedThroughput(10L, 10L))
                    .withGlobalSecondaryIndexes(
                            new GlobalSecondaryIndex()
                                    .withIndexName("AlbumIndex")
                                    .withKeySchema(new KeySchemaElement("album", KeyType.HASH))
                                    .withProjection(new Projection().withProjectionType(ProjectionType.ALL))
                                    .withProvisionedThroughput(new ProvisionedThroughput(5L, 5L))
                    );

            Table table = dynamoDB.createTable(request);
            table.waitForActive();
            System.out.println("Success! Table status: " + table.getDescription().getTableStatus());

        } catch (Exception e) {
            System.err.println("Unable to create table:");
            System.err.println(e.getMessage());
        }
    }
}
