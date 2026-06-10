import { View, Text } from "react-native";
import { View as TWView, Text as TWText } from "../../../components/tw";

type BookingStepIndicatorProps = {
  currentStep: number;
};

const steps = ["Route", "Agency", "Bus", "Seats", "Pay"];

export default function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  return (
    <TWView className="flex-row items-center justify-between py-2 px-1">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <TWView key={step} className="flex-1 items-center relative">
            <TWView
              className={`h-[34px] w-[34px] rounded-full border items-center justify-center ${
                isComplete || isActive ? "bg-blue-600 border-blue-600" : "bg-slate-50 border-slate-300"
              }`}
            >
              <TWText
                className={`font-medium text-[14px] ${
                  isComplete || isActive ? "text-white" : "text-slate-800"
                }`}
              >
                {isComplete ? "✓" : stepNumber}
              </TWText>
            </TWView>
            <TWText className="mt-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {step}
            </TWText>
            {index < steps.length - 1 && (
              <TWView
                className={`absolute top-4 -right-4 h-[2px] w-8 rounded-full ${
                  stepNumber < currentStep ? "bg-blue-600" : "bg-slate-300"
                }`}
              />
            )}
          </TWView>
        );
      })}
    </TWView>
  );
}
