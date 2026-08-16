export const isNfcSupported = () => {
  return 'NDEFReader' in window;
};

export const readNfc = async () => {
  if (!isNfcSupported()) return { error: 'NFC not supported on this device' };

  try {
    const ndef = new window.NDEFReader();
    await ndef.scan();
    
    return new Promise((resolve, reject) => {
      ndef.addEventListener("reading", ({ message, serialNumber }) => {
        try {
          // Find text record
          for (const record of message.records) {
            if (record.recordType === "text") {
              const textDecoder = new TextDecoder(record.encoding);
              const text = textDecoder.decode(record.data);
              resolve(text);
              return;
            }
          }
          resolve(serialNumber); // fallback
        } catch (error) {
          reject('Error decoding NFC data');
        }
      }, { once: true });
      
      ndef.addEventListener("error", () => {
        reject('Error reading NFC tag');
      });
    });
  } catch (error) {
    return { error: 'Failed to start NFC scan' };
  }
};

export const writeNfc = async (code) => {
  if (!isNfcSupported()) return { error: 'NFC not supported on this device' };

  try {
    const ndef = new window.NDEFReader();
    await ndef.write({
      records: [{ recordType: "text", data: code }]
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to write to NFC tag. Ensure it is close and writeable.' };
  }
};
