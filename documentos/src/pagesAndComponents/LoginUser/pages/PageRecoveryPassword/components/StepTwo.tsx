import Input from "../../../components/Input";

interface StepFunctionsProps {
  nextStep: () => void;
  prevStep?: () => void;
}

export default function StepTwo({ prevStep, nextStep }: StepFunctionsProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <main className="max-w-md bg-white-light shadow-lg p-10">
        <div className="mb-5">
          <h1 className="text-2xl mb-2 font-bold">Confirmação de identidade</h1>
          <p className="text-[#b6b6b6] leading-normal">
            Um código foi enviado para o seu e-mail. Por favor, insira-o abaixo.
          </p>
        </div>
        <form className="flex flex-col gap-5">
          <Input type="number" placeholder="666" />

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={prevStep}
              className="bg-[#dcdcdc] font-semibold rounded-md px-5 py-1 text-black-darker"
            >
              Voltar
            </button>
            <button
              onClick={nextStep}
              className="bg-red-600 hover:bg-red-700 font-semibold text-white rounded-md px-5 py-1 transition-colors"
            >
              Confirma
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
