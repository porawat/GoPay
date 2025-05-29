import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload, Modal } from "antd";
import * as XLSX from "xlsx";
const { Dragger } = Upload;

const ImportFileForm = ({ open, onCancel, onImport }) => {
  const [fileList, setFileList] = useState([]);
  const [jsonData, setJsonData] = useState([]);

  const props = {
    name: "file",
    multiple: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setJsonData(json);
      };
      reader.readAsArrayBuffer(file);
      setFileList([file]);
      return false; // prevent upload
    },
    onRemove: () => {
      setFileList([]);
      setJsonData([]);
    },
    fileList,
    accept: ".xlsx,.xls",
    showUploadList: true,
  };

  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag xlsx file to this area to upload
        </p>
        <p className="ant-upload-hint">รองรับเฉพาะไฟล์ Excel (.xlsx, .xls)</p>
      </Dragger>
      {/* {jsonData.length > 0 && (
        <pre className="mt-4 bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )} */}
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          disabled={jsonData.length === 0}
          onClick={() => onImport(jsonData)}
        >
          Import
        </Button>
      </div>
    </div>
  );
};

export default ImportFileForm;
