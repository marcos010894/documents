import Container from "../../components/container";
import Logo from "../../../../../public/salexpress-logo.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import StepOne from "./components/StepOne";
import StepTwo from "./components/StepTwo";
import StepThree from "./components/StepThree";

export default function PageRecoverPassword() {
  const [currentStep, setCurrentStep] = useState(1);

  function nextStap() {
    setCurrentStep(currentStep + 1);
  }

  function prevStep() {
    setCurrentStep(currentStep - 1);
  }

  
  function renderStep() {
    switch (currentStep) {
      case 1:
        return <StepOne nextStep={nextStap} />;
      case 2:
        return <StepTwo nextStep={nextStap} prevStep={prevStep} />;
      case 3:
        return <StepThree nextStep={nextStap} prevStep={prevStep} />;
      default:
        return null;
    }
  }

  return (
    <Container>
      <header className="py-5">
        <Link to={"/"}>
          <img src={Logo}  style={{width: "200px"}} alt="Logo da Salexpress" />
        </Link>
      </header>

      {renderStep()}
    </Container>
  );
}
