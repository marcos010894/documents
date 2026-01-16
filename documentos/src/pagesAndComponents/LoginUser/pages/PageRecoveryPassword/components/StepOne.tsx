import Input from "../../../components/Input";

interface StepProps {
  nextStep: () => void;
}

export default function StepOne({ nextStep }: StepProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
      <main className="max-w-md bg-white-light shadow-lg p-10">
        <h1 className="text-2xl mb-5 font-bold">
          Insira o nome de usuário referente  à sua conta
        </h1>
        <form className="flex flex-col gap-5">
          <div>
            <label className="block mb-2" htmlFor="username">
              Username
            </label>
            <Input type="text" placeholder="Digite aqui" />
          </div>

          <div className="flex items-center gap-3 justify-end">

            <button onClick={nextStep} className="bg-red-600 hover:bg-red-700 font-semibold text-white rounded-md px-5 py-1 transition-colors">
              Confirma
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
