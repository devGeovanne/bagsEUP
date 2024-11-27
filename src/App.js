import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Text } from "react-konva";
import useImage from "./hooks/useImage";
import { saveAs } from "file-saver";

const App = () => {
  const defaultStyle = {
    color: "red",
    fontSize: 20,
    fontFamily: "Montserrat",
  };

  const [measures, setMeasures] = useState(() => {
    const savedMeasures = localStorage.getItem("measures");
    return savedMeasures
      ? JSON.parse(savedMeasures)
      : [
          { text: "40CM", x: 300, y: 750, id: "width" },
          { text: "28CM", x: 750, y: 50, id: "height" },
          { text: "10CM", x: 50, y: 50, id: "depth" },
        ];
  });

  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [alignment, setAlignment] = useState("center");
  const [fileName, setFileName] = useState(() => {
    return localStorage.getItem("fileName") || "bolsa-customizada";
  });
  const stageRef = useRef();
  const [image] = useImage(process.env.PUBLIC_URL + "/IMG1.jpg");

  useEffect(() => {
    localStorage.setItem("measures", JSON.stringify(measures));
  }, [measures]);

  useEffect(() => {
    localStorage.setItem("fileName", fileName);
  }, [fileName]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => setUploadedImage(img);
      setUploadedImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageSrc(null);
  };

  const handleInputChange = (id, key, value) => {
    setMeasures((prev) =>
      prev.map((measure) =>
        measure.id === id ? { ...measure, [key]: value } : measure
      )
    );
  };

  const handleDragMove = (e, id) => {
    const { x, y } = e.target.position();
    setMeasures((prev) =>
      prev.map((measure) => (measure.id === id ? { ...measure, x, y } : measure))
    );
  };

  const calculateAlignment = () => {
    if (!uploadedImage) return { x: 0, y: 0 };
    const stageWidth = 800;
    const stageHeight = 800;
    const imageWidth = uploadedImage.width;
    const imageHeight = uploadedImage.height;

    switch (alignment) {
      case "top-left":
        return { x: 0, y: 0 };
      case "top-right":
        return { x: stageWidth - imageWidth, y: 0 };
      case "bottom-left":
        return { x: 0, y: stageHeight - imageHeight };
      case "bottom-right":
        return { x: stageWidth - imageWidth, y: stageHeight - imageHeight };
      case "center":
      default:
        return {
          x: (stageWidth - imageWidth) / 2,
          y: (stageHeight - imageHeight) / 2,
        };
    }
  };

  const downloadImage = () => {
    const uri = stageRef.current.toDataURL();
    const formattedFileName = fileName.replace(/\s+/g, '-').toLowerCase();
    saveAs(uri, `${formattedFileName}.jpg`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftColumn}>
        <h2 style={styles.sectionTitle}>Configurações</h2>
        <div style={styles.card}>
          <label style={styles.label}>Upload de Imagem:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.input}
          />
          <label style={styles.label}>Nome do Arquivo:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={styles.input}
          />
          <label style={styles.label}>Alinhamento:</label>
          <select
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            style={styles.select}
          >
            <option value="center">Centralizado</option>
            <option value="top-left">Superior Esquerdo</option>
            <option value="top-right">Superior Direito</option>
            <option value="bottom-left">Inferior Esquerdo</option>
            <option value="bottom-right">Inferior Direito</option>
          </select>
          {uploadedImageSrc && (
            <button onClick={handleRemoveUploadedImage} style={styles.removeButton}>
              Remover Imagem
            </button>
          )}
        </div>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Estilo do Texto</h2>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Cor:
              <input
                type="color"
                value={defaultStyle.color}
                onChange={(e) =>
                  handleInputChange("color", e.target.value)
                }
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Tamanho:
              <input
                type="number"
                value={defaultStyle.fontSize}
                onChange={(e) =>
                  handleInputChange("fontSize", e.target.value)
                }
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Fonte:
              <select
                value={defaultStyle.fontFamily}
                onChange={(e) =>
                  handleInputChange("fontFamily", e.target.value)
                }
                style={styles.select}
              >
                <option value="Montserrat">Montserrat</option>
                <option value="Maven Pro">Maven Pro</option>
              </select>
            </label>
          </div>
        </div>
        <button onClick={downloadImage} style={styles.downloadButton}>
          Baixar Imagem
        </button>
      </div>

      <div style={styles.centerColumn}>
        <Stage width={800} height={800} ref={stageRef} style={styles.stage}>
          <Layer>
            {image && (
              <Image
                image={image}
                width={800}
                height={800}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {uploadedImage && (
              <Image
                image={uploadedImage}
                {...calculateAlignment()}
                draggable
              />
            )}
            {measures.map((measure) => (
              <Text
                key={measure.id}
                text={measure.text}
                x={measure.x}
                y={measure.y}
                fill={measure.color}
                fontSize={measure.fontSize}
                fontFamily={measure.fontFamily}
                draggable
                onDragMove={(e) => handleDragMove(e, measure.id)}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div style={styles.rightColumn}>
        <h2 style={styles.sectionTitle}>Medidas</h2>
        <div style={styles.card}>
          {measures.map((measure) => (
            <div key={measure.id} style={styles.inputGroup}>
              <label style={styles.label}>
                {measure.id}:
                <input
                  type="text"
                  value={measure.text}
                  onChange={(e) =>
                    handleInputChange(measure.id, "text", e.target.value)
                  }
                  style={styles.input}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "20px",
    fontFamily: "'Montserrat', sans-serif",
    backgroundColor: "#f4f4f9",
  },
  leftColumn: {
    width: "25%",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  centerColumn: {
    width: "50%",
    textAlign: "center",
    padding: "20px",
  },
  rightColumn: {
    width: "25%",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  card: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "#333",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
  removeButton: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  stage: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  downloadButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
};

export default App;
