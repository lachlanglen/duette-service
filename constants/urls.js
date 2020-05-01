export const getAWSUrl = key => {
  return `https://duette.s3.us-east-2.amazonaws.com/${key}.mov`;
};

export const getAWSThumbnail = key => {
  return `https://duette.s3.us-east-2.amazonaws.com/${key}thumbnail.png`;
};
