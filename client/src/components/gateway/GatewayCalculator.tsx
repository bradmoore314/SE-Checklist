import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Step1AddCameras from './Step1AddCameras';
import Step2ViewResults from './Step2ViewResults';
import Step3AssignCameras from './Step3AssignCameras';
import HelpModal from './HelpModal';
import CompletionModal from './CompletionModal';
import { StreamCamera, Stream, GatewayConfiguration, Calculations } from '@shared/schema';
import { calculateRequirements, calculateGatewaysNeeded, getLensTypeText } from '@/lib/gateway-calculator';

export default function GatewayCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cameras, setCameras] = useState<StreamCamera[]>([]);
  const [cameraEditIndex, setCameraEditIndex] = useState<number>(-1);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [calculations, setCalculations] = useState<Calculations>({
    totalStreams: 0,
    totalThroughput: 0,
    totalStorage: 0
  });
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfiguration>({
    type: '16ch',
    count: 1
  });
  const [streams, setStreams] = useState<Stream[]>([]);
  const [gatewayAssignments, setGatewayAssignments] = useState<{[gatewayId: string]: Stream[]}>({});

  // Reset the application to its initial state and clear any cached data
  const resetApplication = () => {
    setCameras([]);
    setCameraEditIndex(-1);
    setCurrentStep(1);
    setCalculations({
      totalStreams: 0,
      totalThroughput: 0,
      totalStorage: 0
    });
    setGatewayConfig({
      type: '16ch',
      count: 1
    });
    setStreams([]);
    setGatewayAssignments({});
    setIsCompletionModalOpen(false);
    
    // Clear any browser storage that might contain mock data
    try {
      localStorage.removeItem('gateway-calculator-cameras');
      sessionStorage.removeItem('gateway-calculator-cameras');
    } catch (error) {
      console.log('No cached camera data to clear');
    }
  };

  // Go to step 2 and calculate requirements
  const calculateAndProceed = () => {
    const calc = calculateRequirements(cameras);
    setCalculations(calc);
    
    // Determine gateway recommendation
    const recommendationType = 
      calc.totalStreams <= 8 && calc.totalThroughput <= 320 && calc.totalStorage <= 6
        ? '8ch'
        : '16ch';
        
    const recommendedCount = 
      recommendationType === '8ch' 
        ? 1 
        : calculateGatewaysNeeded(calc.totalStreams, calc.totalThroughput, calc.totalStorage);
    
    setGatewayConfig({
      type: recommendationType,
      count: recommendedCount
    });
    
    setCurrentStep(2);
  };

  // Go to step 3 and prepare for gateway assignment
  const proceedToAssign = (config: GatewayConfiguration) => {
    setGatewayConfig(config);
    
    // Generate individual streams from cameras
    const allStreams: Stream[] = [];
    cameras.forEach((camera, cameraIndex) => {
      for (let i = 0; i < camera.lensCount; i++) {
        const mpPerSecond = camera.streamingResolution * camera.frameRate;
        const bitrate = getBitrateForResolution(camera.recordingResolution);
        const storage = (86400 * camera.storageDays * bitrate) / 8000000;
        
        allStreams.push({
          id: `${cameraIndex}-${i}`,
          name: camera.lensCount === 1 ? camera.name : `${camera.name} (Stream ${i + 1})`,
          lensType: getLensTypeText(camera.lensCount),
          resolution: `${camera.streamingResolution} MP`,
          frameRate: `${camera.frameRate} fps`,
          throughput: mpPerSecond,
          storage: storage,
          cameraId: `camera-${cameraIndex}`
        });
      }
    });
    
    setStreams(allStreams);
    
    // Initialize empty gateway assignments
    const initialAssignments: {[gatewayId: string]: Stream[]} = {};
    for (let i = 0; i < config.count; i++) {
      initialAssignments[i.toString()] = [];
    }
    setGatewayAssignments(initialAssignments);
    
    setCurrentStep(3);
  };

  // Helper functions
  const getBitrateForResolution = (resolution: number): number => {
    const bitrateTable: {[key: number]: number} = {
      0.3: 1.0,
      1: 1.5,
      2: 2.0,
      4: 2.5,
      5: 2.8,
      6: 3.0,
      8: 3.5,
      12: 4.0
    };
    
    return bitrateTable[resolution] || 2.0;
  };

  // Check if all streams are assigned
  const checkAllStreamsAssigned = (): boolean => {
    // Count total assigned streams
    const assignedStreamCount = Object.values(gatewayAssignments)
      .reduce((acc, gatewayStreams) => acc + gatewayStreams.length, 0);
    
    return assignedStreamCount === streams.length;
  };

  // Handle completion of assignment
  const handleFinish = () => {
    setIsCompletionModalOpen(true);
  };
  
  // Handle export
  const handleExport = () => {
    // For future implementation - would export configuration to file
    console.log('Export configuration:', {
      cameras,
      calculations,
      gatewayConfig,
      assignments: gatewayAssignments
    });
    
    setIsCompletionModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header onToggleHelp={() => setIsHelpModalOpen(true)} />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          {currentStep === 1 && (
            <Step1AddCameras
              cameras={cameras}
              setCameras={setCameras}
              cameraEditIndex={cameraEditIndex}
              setCameraEditIndex={setCameraEditIndex}
              onCalculate={calculateAndProceed}
            />
          )}
          
          {currentStep === 2 && (
            <Step2ViewResults
              calculations={calculations}
              gatewayConfig={gatewayConfig}
              onBackToStep1={() => setCurrentStep(1)}
              onProceedToAssign={proceedToAssign}
            />
          )}
          
          {currentStep === 3 && (
            <Step3AssignCameras
              streams={streams}
              setStreams={setStreams}
              gatewayConfig={gatewayConfig}
              gatewayAssignments={gatewayAssignments}
              setGatewayAssignments={setGatewayAssignments}
              onBackToStep2={() => setCurrentStep(2)}
              onFinish={handleFinish}
              allStreamsAssigned={checkAllStreamsAssigned()}
            />
          )}
        </div>

        {/* Modals */}
        <HelpModal 
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
        
        <CompletionModal
          isOpen={isCompletionModalOpen}
          onClose={() => setIsCompletionModalOpen(false)}
          onExport={handleExport}
          onStartOver={resetApplication}
          calculations={calculations}
          totalCameras={cameras.length}
          gatewayConfig={gatewayConfig}
        />
      </main>
      
      <Footer />
    </div>
  );
}