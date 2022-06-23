import * as AWS from 'aws-sdk';
import ClientConfig from './aws-exports';

class AWSConnector{

  //initialize with ClientConfig
  constructor(){
    AWS.config.update(ClientConfig.aws);
    console.log("Config ",ClientConfig);
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(ClientConfig.cognito);
    this.firehose = new AWS.Firehose();
  }

  //get Cognito user id
  getUserId() {
    let userId = AWS.config.credentials.params.IdentityId;
    console.log('userid',userId)
    if(!userId){
        console.log("In AWSConnector.getUserId ",userId);
        AWS.config.credentials.refresh(function(){
          AWS.config.credentials.params.IdentityId = AWS.config.credentials.identityId;
          console.log("Login refreshed ",AWS.config.credentials.params.IdentityId);
        });
    }
    return userId;
  }

  getCredentials() {
    this.getUserId();
    //console.log("In getCredentials ",AWS.config.credentials);
    return AWS.config.credentials;
  }

  //push to Firehose
  push(data, callback) {
      var firehoseParams = ClientConfig.firehose;
    
      firehoseParams.Record = {
          Data: JSON.stringify(data) + "\n"
      }
      console.log('firehoseParams',firehoseParams)
      this.firehose.putRecord(firehoseParams, callback);
      return true;
  }
}
export default new AWSConnector();
//Escribe un solo registro de datos en un flujo de entrega de Amazon Kinesis Data Firehose. 
//Para escribir varios registros de datos en un flujo de entrega, use PutRecordBatch. 
//Las aplicaciones que utilizan estas operaciones se denominan productores. De forma predeterminada, 
//cada flujo de entrega puede admitir hasta 2000 transacciones por segundo, 5000 registros por segundo o 5 MB por segundo.
//Si usa PutRecord y PutRecordBatch, los límites son un agregado entre estas dos operaciones para cada flujo de entrega. 
//Para obtener más información sobre los límites y cómo solicitar un aumento, consulte Límites de Amazon Kinesis Data Firehose.
//Debe especificar el nombre del flujo de entrega y el registro de datos cuando utilice PutRecord.
//El registro de datos consta de un blob de datos que puede tener un tamaño de hasta 1000 KiB y cualquier tipo de datos. 
//Por ejemplo, puede ser un segmento de un archivo de registro, datos de ubicación geográfica, datos de flujo de clics en un sitio web, etc.
//Kinesis Data Firehose almacena en búfer los registros antes de enviarlos al destino. 
//Para eliminar la ambigüedad de los blobs de datos en el destino, una solución común es usar delimitadores en los datos, como una nueva línea (\n) o algún otro carácter único dentro de los datos. Esto permite que la aplicación del consumidor analice elementos de datos individuales al leer los datos del destino. La operación PutRecord devuelve un RecordId, que es una cadena única asignada a cada registro. Las aplicaciones de productor pueden usar este ID para fines como la auditabilidad y la investigación. Si la operación PutRecord arroja una excepción ServiceUnavailableException, retroceda y vuelva a intentarlo. Si la excepción persiste, es posible que se hayan excedido los límites de rendimiento para el flujo de entrega. Los registros de datos enviados a Kinesis Data Firehose se almacenan durante 24 horas desde el momento en que se agregan a un flujo de entrega mientras intenta enviar los registros al destino. Si no se puede alcanzar el destino durante más de 24 horas, los datos ya no estarán disponibles. No concatene dos o más cadenas base64 para formar los campos de datos de sus registros. En su lugar, concatene los datos sin procesar y luego realice la codificación base64.