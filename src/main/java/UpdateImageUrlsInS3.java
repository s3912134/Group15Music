import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;

public class UpdateImageUrlsInS3 {
    public static void main(String[] args) {
        Table table = new DynamoDB(AmazonDynamoDBClientBuilder.standard()
                .withRegion("us-east-1").build()).getTable("music");

        for (Item item : table.scan()) {
            String title = item.getString("title");
            String artist = item.getString("artist");
            String image_url = item.getString("image_url");
            if (title == null || artist == null) continue;


            String fileName =image_url .substring(image_url .lastIndexOf('/') + 1);
            String url = "https://musicsanad.s3.us-east-1.amazonaws.com/artists/" + fileName;

            table.updateItem(new UpdateItemSpec()
                    .withPrimaryKey("title", title, "artist", artist)
                    .withUpdateExpression("set image_url = :url")
                    .withValueMap(new ValueMap().withString(":url", url)));


            System.out.println("Update.. next");
        }

        System.out.println("Done.");
    }
}
