# Pokémon TCG Pocket - Cards Download

> [!NOTE]
> The latest excel contains cards from the extension **Extradimensional Crisis** released on **May 29, 2025**.


## Description
This project includes a JavaScript script specifically designed to scrape images for the game Pokémon TCG Pocket from a Google Drive folder using a service account.

> [!WARNING]
> This script was made exclusively for Pokémon TCG Pocket's assets and is not intended for scraping or downloading any other type of Drive content.

The script reads from an Excel file to determine which images to download and what filenames they should be saved as locally.

## Excel File Structure
The Excel file is essential for the process, acting as a mapping between the images stored on Google Drive and their new local filenames.

Each Pokémon card extension (e.g. Base Set, Items...) must have its own sheet inside the Excel file.

Each sheet should include the following columns:

![Image](https://img001.prntscr.com/file/img001/ptHfX0oaQeKEhXHXhK8CwQ.png)

- **card**: A human-readable label for informational purposes only (not required by the script).

- **old_code**: The code or part of the filename used to locate the corresponding image file on Google Drive.

- **new_code**: The new name in order to sort the card according to game order.

*Example: If there’s a file named PIKA001 in Drive, and your Excel has old_code = PIKA001 and new_code = 001_Pikachu, the script will download the file and rename it to 001_Pikachu.webp.*

It is very useful to have the Excel file to get the good order of the cards, as the script will download the images in the order they are listed in the Excel file.

## Prerequisites 
Before running the script, make sure you’ve installed all required Node.js dependencies.

### Install all dependencies

Run the following command in your project directory:
```
npm install
```

### Google Drive API Service Account Setup
To access Google Drive, the script uses a Google Cloud Service Account JSON key.
Without this key, authentication and image retrieval won’t be possible.

Follow these steps to create the service account and generate the `service-account-key.json`:

#### 1️⃣ Create a Google Cloud Project
- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Click the project selector at the top, then "New Project".
- Name your project (e.g. TCG Pocket Collection Tracker) and click "Create".

#### 2️⃣ Enable the Google Drive API
- Inside your project, go to APIs & Services > Library.
- Search for Google Drive API.
- Click it and then click "Enable".

#### 3️⃣ Create a Service Account
- Go to IAM & Admin > Service Accounts.
- Click "Create Service Account".
- Name it (e.g. tcg-api-service), then click "Create and Continue".
- Assign the role: Project > Editor (or a more restricted role if preferred).
- Click Done.

#### 4️⃣ Generate the JSON Key
- In the Service Accounts list, click your newly created service account.
- Go to the "Keys" tab.
- Click "Add Key" > "Create new key".
- Choose JSON and click Create.
- A JSON file will be downloaded — keep it safe.
- Rename it to service-account-key.json for consistency.

#### 5️⃣ Place the JSON Key in the Script Folder
- Move the `service-account-key.json` file into your project's scripts directory.
- This file is used by the script to authenticate with the Google Drive API.

## How the script works
- The script processes one extension at a time.
- For the current extension:
    - It reads the corresponding sheet in the Excel file.
    - It loops through each row in the sheet.
    - For each old_code, it searches for any file on Google Drive whose name contains that old_code.
    - If a matching file is found:
        - It downloads the file locally.
        - It temporarily renames the file using the new_code (from the Excel sheet) to sort and organize the files in a local list following the game's order.

- Once all files for the extension are downloaded and ordered:
    - The script renames and downloads all files to follow the format `<extension>_<index>.webp` *(example: A1_001.webp, A1_002.webp, A1_003.webp)*
- It then moves on to the next extension and repeats the process.
