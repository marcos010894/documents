import Input from "../../../components/Input";

interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
}

export default function StepThree({ nextStep, prevStep }: StepProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <main className="max-w-md bg-white-light shadow-lg p-10">
        <h1 className="text-2xl mb-5 font-bold">Alteração de senha</h1>
        <form className="flex flex-col gap-3">

          <div>
            <label>Nova senha</label>
            <Input type="password" placeholder="Digite aqui" />
          </div>

          <div>
            <label>Confirme sua senha</label>
            <Input type="password" placeholder="Digite aqui" />
          </div>
          <p className="text-[#b6b6b6] font-bold">
            A senha deverá ser alterada a cada 12 meses
          </p>

          <div className="flex items-center gap-3 mt-6 justify-end">
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
