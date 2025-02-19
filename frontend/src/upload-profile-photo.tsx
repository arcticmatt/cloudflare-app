import { useEffect, useState } from "react";
import { SERVER_URL } from "./constants/server-url";
import styles from "./upload-profile-photo.module.css";

function useProfilePhoto() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/getProfilePhoto`, {
          credentials: "include",
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();

    return () => {
      // Cleanup object URL on unmount
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { photoUrl, loading };
}

export function UploadProfilePhoto() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { photoUrl } = useProfilePhoto();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Using a dummy API endpoint - replace with actual endpoint
      const response = await fetch(`${SERVER_URL}/uploadProfilePhoto`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      {photoUrl && (
        <img src={photoUrl} alt="Profile" className={styles.profileImage} />
      )}
      <div className={styles.uploadSection}>
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className={styles.fileInput}
          accept="image/*"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={styles.uploadButton}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {selectedFile && (
          <p className={styles.fileName}>Selected file: {selectedFile.name}</p>
        )}
      </div>
    </div>
  );
}
