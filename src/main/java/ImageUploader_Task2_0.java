import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class ImageUploader_Task2_0 {
    private static final String BUCKET_NAME = "musicsanad";
    private static final String JSON_FILE_PATH = "2025a1.json";
    public static void main(String[] args) {
        try {
            ProfileCredentialsProvider credentialsProvider = new ProfileCredentialsProvider();
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withCredentials(credentialsProvider)
                    .withRegion(Regions.US_EAST_1)
                    .build();
            createBucketIfNotExists(s3Client);
            List<String> imageUrls = extractImageUrlsFromJson(JSON_FILE_PATH);

            for (String imageUrl : imageUrls) {
                 downloadAndUploadImage(s3Client, imageUrl);
            }
             System.out.println("All images uploaded successfully!");

        } catch (IOException e) {
            System.err.println("I/O Exception: " + e.getMessage());
        }}

    private static void createBucketIfNotExists(AmazonS3 s3Client) {
        if (!s3Client.doesBucketExistV2(BUCKET_NAME)) {
            System.out.println("Bucket Creating: " + BUCKET_NAME);
            s3Client.createBucket(new CreateBucketRequest(BUCKET_NAME));}
    }

    private static List<String> extractImageUrlsFromJson(String jsonFilePath) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        File file = new File(jsonFilePath);

        if (!file.exists()) {
            System.err.println("JSON file not found: " + jsonFilePath);
            return imageUrls;
        }

        StringBuilder jsonContent = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
             String line;
            while ((line = reader.readLine()) != null) {
                jsonContent.append(line);
            }
        }

        String jsonString = jsonContent.toString();
        int index = 0;

        while ((index = jsonString.indexOf("\"img_url\"", index)) != -1) {
            int startIndex = jsonString.indexOf("http", index);
            int endIndex = jsonString.indexOf("\"", startIndex);
            if (startIndex != -1 && endIndex != -1) {
                imageUrls.add(jsonString.substring(startIndex, endIndex));
            }
            index = endIndex;
        }
        return imageUrls;
    }

    private static void downloadAndUploadImage(AmazonS3 s3Client, String imageUrl) {
        try {

            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            File tempFile = new File(System.getProperty("java.io.tmpdir"), fileName);
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);



            try (InputStream inputStream = connection.getInputStream();
                 FileOutputStream outputStream = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }

            s3Client.putObject(new PutObjectRequest(BUCKET_NAME, "artists/" + fileName, tempFile));
            System.out.println("Uploaded: " + fileName);

            tempFile.delete();

        } catch (Exception e) {
            System.err.println("Failed to process image: " + imageUrl);
            e.printStackTrace();
        }
    }
}