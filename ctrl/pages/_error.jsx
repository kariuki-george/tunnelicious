import * as Sentry from "@sentry/nextjs";
import Era from "next/error";

const CustomErrorComponent = (props) => {
  return <Era statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Era.getInitialProps(contextData);
};

export default CustomErrorComponent;
