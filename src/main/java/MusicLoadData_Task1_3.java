import java.io.File;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class MusicLoadData_Task1_3 {

    public static void main(String[] args) throws Exception {
        AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
                .withRegion("us-east-1") //
                .build();

        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable("music");
        // Load JSON   file
        JsonParser parser = new JsonFactory().createParser(new File("2025a1.json"));
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(parser);
        // Checking if  "songs" array exists
        JsonNode songsArray = rootNode.path("songs");

        for (JsonNode node : songsArray) {
            if (!node.isObject()) {
                System.err.println("Skipping non-object node: " + node.toString());
                continue; // Skip non -  object nodes
            }

            String title = node.path("title").asText();
            String artist = node.path("artist").asText();
            int year = node.path("year").asInt();
            String album = node.path("album").asText();
            String imageUrl = node.path("img_url").asText();

            try {
                table.putItem(new Item()
                        .withPrimaryKey("title", title, "artist", artist)
                           .withNumber("year", year)
                        .withString("album", album)
                           .withString("image_url", imageUrl));

                System.out.println("PutItem succeeded: " + title + " by " + artist);
            } catch (Exception e) {
                  System.err.println("Unable to add song: " + title + " by " + artist);
                  System.err.println(e.getMessage());
                break;
            }
        }

        parser.close();
    }


}
