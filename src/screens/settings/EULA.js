import React, { Component } from 'react'
import { View, Text, Button, ActivityIndicator, Dimensions, Linking, ScrollView, Image, Alert } from 'react-native'
import { ListItem, Icon, Avatar as AvatarAlt, Button as ButtonAlt  } from 'react-native-elements';
var { height, width } = Dimensions.get('window');
import Avatar from '../cmps/avatar.js'
var SQLite = require('react-native-sqlite-storage')
import DeviceInfo from 'react-native-device-info';
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

let ambermex_logo = require("../../../assets/image/AMBERMEX_HORIZONTAL.png");
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';

class EULA extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: navigation.state.params != undefined && navigation.state.params.loading ?
    () => <ActivityIndicator size="small" color="#0E75FA" style={{alignSelf:'center'}} />
    :
    "Acuerdo de Licencia",
    headerBackTitle: ' ',
    headerLeftContainerStyle:{
      padding:10,
      paddingLeft:0
    },
    headerTintColor: '#7D9D78',
    headerTitleStyle: {color:'black'},
  });

  constructor(props) {
    super(props);

    this.state = {
      loadingTerms:true,
      accepting:false
    }
  }

  componentDidMount(){

  }

  acceptTerms(){

  }

  render() {

    return (
      <ScrollView style={{flex:1, backgroundColor:'white'}}>
        <View style={{flex:1, padding:20}}>
          <Text style={{fontWeight:'bold', color:'black', fontSize:18, marginBottom:20}}>Acuerdo de licencia de usuario final.</Text>
          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Actualizado a 2021-01-29.</Text>
          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Definiciones y términos clave.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Para ayudar a explicar las cosas de la manera más clara posible en este Eula, cada vez que se hace referencia a cualquiera de estos términos, se definen estrictamente como:</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -Cookie: pequeña cantidad de datos generados por un sitio web y guardados por su navegador web. Se utiliza para identificar su navegador, proporcionar análisis, recordar información sobre usted, como su preferencia de idioma o información de inicio de sesión.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -Empresa: cuando esta política menciona “Compañía”, “nosotros”, “nos” o “nuestro”, se refiere a Tecnologías Amber de México S. de R.L de C.V., Blvd. Privada Juriquilla No. 401, La Solana, 76226 que es responsable de su información bajo este Eula.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -País: donde se encuentran Botón Ambermex o los propietarios / fundadores de Botón Ambermex, en este caso es México.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -Servicio: se refiere al servicio proporcionado por Botón Ambermex como se describe en los términos relativos (si está disponible) y en esta plataforma.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -Servicio de terceros: se refiere a anunciantes, patrocinadores de concursos, socios promocionales y de marketing, y otros que brindan nuestro contenido o cuyos productos o servicios creemos que pueden interesarle.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}> -Usted: una persona o entidad que está registrada con Botón Ambermex para utilizar los Servicios.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Introducción.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Este Acuerdo de licencia de usuario final (el "Acuerdo") es un acuerdo vinculante entre usted ("Usuario final", "usted" o "su") y Tecnologías Amber de México S. de R.L de C.V. ("Compañía", "nosotros", "nos" o "nuestro"). Este Acuerdo rige la relación entre usted y nosotros, y su uso de Botón Ambermex. A lo largo de este Acuerdo, el Usuario final y la Compañía pueden denominarse "Parte" o, en conjunto, las "Partes".</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Si está utilizando la aplicación en nombre de su empleador u otra entidad (una "Organización") para cuyo beneficio utiliza la aplicación o quién posee o controla los medios a través de los cuales utiliza o accede a la aplicación, entonces los términos "Usuario final ”,“ Usted ”y“ su ”se aplicarán colectivamente a usted como individuo y a la Organización. Si usa o compra una licencia o para la aplicación en nombre de una Organización, por la presente reconoce, garantiza y se compromete a tener la autoridad para 1) comprar una licencia de la aplicación en nombre de la Organización; 2) obligar a la Organización a los términos de este Acuerdo.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Al descargar, instalar, acceder o utilizar la aplicación, usted: (a) afirma que tiene todos los permisos y autorizaciones necesarios para acceder y utilizar la aplicación; (b) si está utilizando la aplicación de conformidad con una licencia comprada por una organización, que está autorizado por esa organización para acceder y utilizar la aplicación (c) reconoce que ha leído y comprende este acuerdo; (d) declarar que está en su sano juicio y es mayor de edad (18 años de edad o más) para celebrar un acuerdo vinculante; y (e) aceptar y aceptar estar legalmente obligado por los términos y condiciones de este acuerdo.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Si no está de acuerdo con estos términos, no descargue, instale, acceda ni utilice el software. si ya ha descargado el software, elimínelo de su dispositivo informático.
          Botón Ambermex le otorga la licencia de la Aplicación, no la vende, para que la use estrictamente de acuerdo con los términos de este Acuerdo.
          </Text>
          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Licencia.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Sujeto a los términos de este Acuerdo y, si corresponde, a los términos previstos en el Acuerdo de Licencia, Botón Ambermex le otorga una licencia limitada, no exclusiva, perpetua, revocable e intransferible para:</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> (a) descargar, instalar y usar el Software en un (1) Dispositivo de Computación por cada licencia de usuario único que haya comprado y obtenido. Si tiene varios Dispositivos informáticos en los que desea utilizar el Software, acepta adquirir una licencia para la cantidad de dispositivos que desea utilizar;</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> (b) acceder, ver y utilizar en dicho Dispositivo informático los Materiales proporcionados por el usuario final puestos a disposición en el Software o accesibles de otro modo a través del Software, estrictamente de acuerdo con este Acuerdo y cualquier otro término y condición aplicable a dichos Materiales proporcionados por el usuario final;</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> (c) instalar y utilizar la versión de prueba del Software en cualquier número de Dispositivos de Computación durante un período de prueba de quince (15) días únicos después de la instalación.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}> (d) recibir actualizaciones y nuevas funciones que estén disponibles durante el período de un (1) año a partir de la fecha en que compró la licencia del Software.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Propiedad intelectual.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Toda propiedad intelectual, incluidos los derechos de autor, patentes, divulgaciones de patentes e invenciones (patentables o no), marcas de servicio de marcas comerciales, secretos comerciales, conocimientos técnicos y otra información confidencial, imagen comercial, nombres comerciales, logotipos, nombres corporativos y nombres de dominio, en conjunto con toda la buena voluntad asociada allí con, trabajos derivados y todos los demás derechos (colectivamente, "Derechos de propiedad intelectual") que son parte del Software que de otra manera son propiedad de Botón Ambermex siempre serán propiedad exclusiva de Botón Ambermex (o de sus proveedores o otorgantes de licencias, si corresponde). Nada en este Acuerdo le otorga a usted (ni a ninguna Organización) una licencia de Botón Ambermex.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Derechos de propiedad intelectual.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Usted acepta que este Acuerdo otorga una licencia limitada para usar Botón Ambermex. Derechos de propiedad intelectual ", únicamente como parte del Software (y no independientemente de él), y solo por el Plazo de vigencia de la licencia que se le otorga a continuación. . En consecuencia, su uso de cualquiera de los Derechos de Propiedad Intelectual de Botón Ambermex. "Independientemente del Software o fuera del alcance de este Acuerdo se considerará una infracción de los Derechos de Propiedad Intelectual de Botón Ambermex". Sin embargo, esto no limitará cualquier reclamo que Botón Ambermex pueda tener por incumplimiento de contrato en caso de que usted incumpla algún término o condición de este Acuerdo. Deberá utilizar el más alto nivel de cuidado para salvaguardar todo el Software (incluidas todas las copias del mismo) contra infracción, apropiación indebida, robo, uso indebido o acceso no autorizado. Salvo que se otorgue expresamente en este Acuerdo, Botón Ambermex se reserva y retendrá todos los derechos, títulos e intereses en el Software, incluidos todos los derechos de autor y la materia sujeta a derechos de autor, las marcas comerciales y la materia susceptible de marca registrada, las patentes y la materia patentable, los secretos comerciales y otros derechos de propiedad intelectual, registrados, no registrados, otorgados, solicitados, o ambos existentes o que puedan crearse, relacionados con los mismos.
          </Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Usted (o la Organización, si corresponde) conservará la propiedad de todos los Derechos de propiedad intelectual sobre los productos de trabajo que cree a través o con la ayuda del Software.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Tus sugerencias.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Cualquier retroalimentación, comentario, idea, mejora o sugerencia (en conjunto, "Sugerencias") que usted le proporcione a Botón Ambermex con respecto a la Aplicación, seguirá siendo propiedad única y exclusiva de Botón Ambermex.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Botón Ambermex tendrá la libertad de usar, copiar, modificar, publicar o redistribuir las Sugerencias para cualquier propósito y de cualquier manera sin ningún crédito o compensación para usted.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Modificaciones a la aplicación.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Botón Ambermex se reserva el derecho de modificar, suspender o descontinuar, temporal o permanentemente, la Aplicación o cualquier servicio al que se conecte, con o sin aviso y sin responsabilidad hacia usted.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Actualizaciones de la aplicación.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Botón Ambermex puede, de vez en cuando, proporcionar mejoras o mejoras a las características / funcionalidad de la Aplicación, que pueden incluir parches, correcciones de errores, actualizaciones, mejoras y otras modificaciones ("Actualizaciones").</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Las actualizaciones pueden modificar o eliminar ciertas características y / o funcionalidades de la Aplicación. Usted acepta que Botón Ambermex no tiene la obligación de (i) proporcionar Actualizaciones, o (ii) continuar proporcionándole o habilitando características y / o funcionalidades particulares de la Aplicación.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Además, acepta que todas las Actualizaciones (i) se considerarán como parte integral de la Aplicación y (ii) estarán sujetas a los términos y condiciones de este Acuerdo.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Duración y Terminación.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Este Acuerdo permanecerá en vigor hasta que usted o Botón Ambermex lo rescindan.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Botón Ambermex puede, a su exclusivo criterio, en cualquier momento y por cualquier motivo o sin él, suspender o rescindir este Acuerdo con o sin previo aviso.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Este Acuerdo terminará inmediatamente, sin previo aviso de Botón Ambermex, en caso de que usted no cumpla con alguna disposición de este Acuerdo. También puede rescindir este Acuerdo eliminando la Aplicación y todas las copias de la misma de su computadora.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Tras la terminación de este Acuerdo, deberá dejar de usar la Aplicación y eliminar todas las copias de la Aplicación de su computadora.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>La terminación de este Acuerdo no limitará ninguno de los derechos o recursos de Botón Ambermex. "" "Por ley o en equidad en caso de incumplimiento por su parte (durante la vigencia de este Acuerdo) de cualquiera de sus obligaciones en virtud del presente Acuerdo.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Indemnización.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Usted acepta indemnizar, defender y mantener indemne a Botón Ambermex y sus funcionarios, directores, empleados, agentes, afiliados, sucesores y cesionarios de y contra todas y cada una de las pérdidas, daños, responsabilidades, deficiencias, reclamos, acciones, juicios, acuerdos, intereses. , premios, sanciones, multas, costos o gastos de cualquier tipo, incluidos los honorarios razonables de abogados, que surjan o se relacionen con: i) su uso o mal uso del Software; ii) su incumplimiento de cualquier ley, reglamento o directiva gubernamental aplicable; iii) tu incumplimiento h de este Acuerdo; o iv) su acuerdo o relación con una Organización (si corresponde) o cualquier tercero. Además, acepta que Botón Ambermex no asume ninguna responsabilidad por la información o el contenido que envíe o ponga a disposición a través de este Software o el contenido que terceros le pongan a su disposición.</Text>
          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Sin garantías.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>La Aplicación se le proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD" y con todas las fallas y defectos sin garantía de ningún tipo. En la medida máxima permitida por la ley aplicable, Botón Ambermex, en su propio nombre y en nombre de sus afiliadas y sus respectivos licenciantes y proveedores de servicios, renuncia expresamente a todas las garantías, ya sean expresas, implícitas, legales o de otro tipo, con respecto a la Aplicación, incluidas todas las garantías implícitas de comerciabilidad, idoneidad para un propósito particular, título y no infracción, y garantías que puedan surgir del curso del trato, el curso del desempeño, el uso o la práctica comercial. Sin limitación a lo anterior, Botón Ambermex no ofrece garantía ni compromiso, y no hace representación de ningún tipo de que la Aplicación cumplirá con sus requisitos, logrará los resultados previstos, será compatible o funcionará con cualquier otro software, aplicación, sistema o servicio, operará sin interrupción, cumplir con los estándares de rendimiento o confiabilidad o estar libre de errores o que cualquier error o defecto pueda o será corregido.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Sin perjuicio de lo anterior, ni Botón Ambermex ni ningún proveedor de Botón Ambermex. "" "Hacen ninguna representación o garantía de ningún tipo, expresa o implícita: (i) en cuanto al funcionamiento o disponibilidad de la Aplicación, o la información, contenido, y materiales o productos incluidos en el mismo; (ii) que la Aplicación será ininterrumpida o libre de errores; (iii) en cuanto a la precisión, confiabilidad o vigencia de cualquier información o contenido proporcionado a través de la Aplicación; o (iv) que la Aplicación, sus servidores, el contenido o los correos electrónicos enviados desde o en nombre de Botón Ambermex están libres de virus, scripts, troyanos, gusanos, malware, bombas de tiempo u otros componentes dañinos.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Algunas jurisdicciones no permiten la exclusión o las limitaciones de las garantías implícitas o las limitaciones de los derechos legales aplicables de un consumidor, por lo que algunas o todas las exclusiones y limitaciones anteriores pueden no aplicarse a usted.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Limitación de responsabilidad.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Sin perjuicio de los daños en los que pueda incurrir, la responsabilidad total de Botón Ambermex y cualquiera de sus proveedores en virtud de cualquier disposición de este Acuerdo y su recurso exclusivo por todo lo anterior se limitará al monto realmente pagado por usted por la Aplicación.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>En la medida máxima permitida por la ley aplicable, en ningún caso Botón Ambermex o sus proveedores serán responsables de ningún daño especial, incidental, indirecto o consecuente de ningún tipo (incluidos, entre otros, daños por lucro cesante, por pérdida de datos). u otra información, por interrupción del negocio, por lesiones personales, por la pérdida de privacidad que surja de o de alguna manera relacionada con el uso o la imposibilidad de usar la Aplicación, software de terceros y / o hardware de terceros utilizado con la Aplicación , o de otra manera en relación con cualquier disposición de este Acuerdo), incluso si Botón Ambermex o cualquier proveedor han sido advertidos de la posibilidad de tales daños e incluso si el recurso no cumple con su propósito esencial.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Algunos estados / jurisdicciones no permiten la exclusión o limitación de daños incidentales o consecuentes, por lo que es posible que la limitación o exclusión anterior no se aplique en su caso.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Divisibilidad.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Si alguna disposición de este Acuerdo se considera inaplicable o inválida, dicha disposición se cambiará e interpretará para lograr los objetivos de dicha disposición en la mayor medida posible según la ley aplicable y las disposiciones restantes continuarán en pleno vigor y efecto.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Renuncia.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Ninguna falta de ejercicio, ni demora en el ejercicio, por parte de cualquiera de las partes, de cualquier derecho o poder en virtud de este Acuerdo, operará como una renuncia a ese derecho o poder. El ejercicio único o parcial de cualquier derecho o poder en virtud de este Acuerdo tampoco impedirá el ejercicio posterior de ese o cualquier otro derecho otorgado en el presente. En caso de conflicto entre este Acuerdo y cualquier compra aplicable u otros términos, regirán los términos de este Acuerdo.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Enmiendas a este Acuerdo.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Botón Ambermex se reserva el derecho, a su sola discreción, de modificar o reemplazar este Acuerdo en cualquier momento. Si una revisión es importante, proporcionaremos un aviso de al menos 30 días antes de que entren en vigencia los nuevos términos. Lo que constituye un cambio material se determinará a nuestro exclusivo criterio.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Si continúa accediendo o utilizando nuestra Aplicación después de que las revisiones entren en vigencia, usted acepta estar sujeto a los términos revisados. Si no está de acuerdo con los nuevos términos, ya no está autorizado a utilizar la Aplicación.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Ley que rige.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Las leyes de México, excluyendo sus conflictos de leyes, regirán este Acuerdo y su uso de la Aplicación. Su uso de la Aplicación también puede estar sujeto a otras leyes locales, estatales, nacionales o internacionales.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Cambios a este acuerdo.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>Nos reservamos el derecho exclusivo de realizar cambios en este Acuerdo de vez en cuando. Su acceso continuo y uso de la aplicación constituye su acuerdo de estar sujeto y su aceptación de los términos y condiciones publicados en ese momento. Usted reconoce y acepta que acepta este Acuerdo (y cualquier enmienda al mismo) cada vez que carga, accede o usa la aplicación. Por lo tanto, le recomendamos que revise este Acuerdo con regularidad.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Si, dentro de los treinta (30) días posteriores a la publicación de cambios o enmiendas a este Acuerdo, usted decide que no está de acuerdo con los términos actualizados, puede retirar su aceptación de los términos enmendados proporcionándonos una notificación por escrito de su retiro. Al proporcionarnos el aviso por escrito de la retirada de su aceptación, ya no está autorizado para acceder o utilizar la aplicación.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Sin relación laboral o de agencia.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Ninguna disposición de este Acuerdo, o cualquier parte de la relación entre usted y Botón Ambermex, tiene la intención de crear ni se considerará o interpretará para crear ninguna relación entre usted y Botón Ambermex que no sea la del usuario final de la aplicación y los servicios proporcionados.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Alivio equitativo.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Usted reconoce y acepta que su incumplimiento de este Acuerdo causaría un daño irreparable a Botón Ambermex por el cual los daños monetarios por sí solos serían inadecuados. Además de los daños y cualquier otro recurso al que Botón Ambermex pueda tener derecho, usted reconoce y acepta que podemos buscar medidas cautelares para prevenir el incumplimiento real, amenazante o continuo de este Acuerdo.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Encabezados.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Los títulos de este Acuerdo son sólo para referencia y no limitarán el alcance de este Acuerdo ni afectarán de otro modo la interpretación de este.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Restricciones geográficas.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>La Compañía tiene su sede en México y se proporciona para acceso y uso principalmente por personas ubicadas en México, y mantiene el cumplimiento de las leyes y regulaciones de México. Si usa la aplicación desde fuera de México, usted es única y exclusivamente responsable del cumplimiento de las leyes locales.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Limitación de tiempo para presentar reclamos.</Text>

          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Cualquier causa de acción o reclamo que pueda tener que surja de o esté relacionada con este acuerdo o la aplicación debe iniciarse dentro de un (1) año después de que se acumule la causa de acción; de lo contrario, dicha causa de acción o reclamo se excluye permanentemente.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Acuerdo completo.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>El Acuerdo constituye el acuerdo completo entre usted y Botón Ambermex con respecto a su uso de la Aplicación y reemplaza todos los acuerdos escritos u orales anteriores y contemporáneos entre usted y Botón Ambermex.</Text>
          <Text style={{color:'gray', fontSize:14, marginBottom:20}}>Es posible que esté sujeto a términos y condiciones adicionales que se aplican cuando usa o compra otros servicios de Botón Ambermex. "’ S ", que Botón Ambermex le proporcionará en el momento de dicho uso o compra.</Text>

          <Text style={{fontWeight:'bold', color:'gray', fontSize:16,marginBottom:10}}>Contáctenos.</Text>

          <Text style={{color:'gray', fontSize:14,marginBottom:5}}>No dude en contactarnos si tiene alguna pregunta sobre este Acuerdo.</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -Via Correo electrónico: snoli@botonambermex.com</Text>
          <Text style={{color:'gray', fontSize:14,marginBottom:5}}> -A través de este enlace: https://www.botonambermex.com/</Text>
        </View>
      </ScrollView>
);
}
}

export default EULA;
