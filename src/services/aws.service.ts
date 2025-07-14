import AWS from 'aws-sdk';

/**Initialize s3 service configuration */
const s3 = new AWS.S3({
  secretAccessKey: process.env.AWS_SECRET,
  accessKeyId: process.env.AWS_KEY,
  // region: process.env.AWS_REGION,
});

class AWSService {
  /**
   * @method deleteFile
   * @returns Promise
   * @description delete an object from aws-s3
   */
  public  deleteFile = async(key: string): Promise<any> =>{
    return new Promise(function (resolve, reject) {
      try {
        /**Define s3 bucket name and file name*/
        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: key,
        };

        /**Delete file from s3 bucket*/
        s3.deleteObject(params, async (err, data) => {
          if (err) reject(err);
          else resolve(data); // data = {}
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default AWSService;
