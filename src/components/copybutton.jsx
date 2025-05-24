import React from "react";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const CopyButton = ({ textToCopy }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      message.success("Copied to clipboard!");
    } catch (err) {
      message.error("Failed to copy!");
    }
  };

  return (
    <Button icon={<CopyOutlined />} onClick={handleCopy}>
      Copy
    </Button>
  );
};

export default CopyButton;
