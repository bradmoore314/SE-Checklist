import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Shield, MapPin, Camera, FileText } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Professional Security
              <span className="text-indigo-600 block">Site Assessments</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Streamline your security evaluations with AI-powered analysis, 
              interactive floorplans, and comprehensive reporting tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Analysis</h3>
                <p className="text-gray-600 text-sm">AI-powered site evaluations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Floorplan Tools</h3>
                <p className="text-gray-600 text-sm">Interactive mapping & annotations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Equipment Config</h3>
                <p className="text-gray-600 text-sm">Cameras, access points & more</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pro Reports</h3>
                <p className="text-gray-600 text-sm">Comprehensive documentation</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-700 italic">
              "This platform has revolutionized how we conduct security assessments. 
              The AI analysis and reporting features save us hours on every project."
            </p>
            <div className="mt-3 text-sm font-medium text-gray-900">
              — Security Professional
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <LoginForm 
            isSignUp={isSignUp} 
            onToggleMode={() => setIsSignUp(!isSignUp)} 
          />
        </div>
      </div>
    </div>
  );
}