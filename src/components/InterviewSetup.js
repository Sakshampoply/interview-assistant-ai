'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { startInterview, setError } from '../store/slices/interviewSlice'

export default function InterviewSetup() {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Full Stack Developer',
    experience: 'Entry-level',
    skills: 'React, Node.js, JavaScript'
  })
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [parsingComplete, setParsingComplete] = useState(false)
  const [parsingStatus, setParsingStatus] = useState('')
  const [step, setStep] = useState(1) // 1: Resume, 2: Missing Info, 3: Questions
  const [parsedData, setParsedData] = useState(null)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setResumeFile(file)
    } else {
      alert('Please select a PDF or DOCX file')
    }
  }

  const parseResume = async () => {
    if (!resumeFile) return

    setLoading(true)
    setParsingStatus('Parsing resume...')
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('resume', resumeFile)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formDataToSend,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('🔍 FULL API RESPONSE:', result)
      console.log('🔍 result.success:', result.success)
      console.log('🔍 Direct data - name:', result.name, 'email:', result.email, 'phone:', result.phone)
      
      if (result.success && (result.name || result.email)) {
        console.log('✅ SUCCESS BRANCH - Parsing successful')
        console.log('Raw API Response:', result)
        console.log('Direct extracted data:', { name: result.name, email: result.email, phone: result.phone })
        console.log('Current formData before update:', formData)
        
        setParsingStatus('Resume parsed successfully!')
        // Create extractedData object from direct API response
        const extractedData = {
          name: result.name,
          email: result.email,
          phone: result.phone
        }
        setParsedData(extractedData)
        
        // Update form data with parsed data - use defaults if missing
        const newFormData = {
          ...formData,
          name: result.name || 'Candidate',
          email: result.email || 'candidate@example.com',
          phone: result.phone || ''
        }
        
        console.log('📝 New formData after update:', newFormData)
        
        setFormData(newFormData)
        setParsingComplete(true)
        
        // Always go directly to step 3 - skip manual input
        setTimeout(() => {
          console.log('🚀 Moving to step 3 with parsed data')
          setStep(3)
        }, 1500)
      } else {
        console.log('❌ FAILURE BRANCH - Parsing failed or no data')
        console.log('result.success:', result.success)
        console.log('result.name:', result.name)
        console.log('result.email:', result.email)
        console.log('Full result object:', result)
        
        setParsingStatus('Could not extract all information from resume')
        setParsingComplete(true)
        // Still go to step 3 with defaults
        setTimeout(() => {
          console.log('🚀 Moving to step 3 with defaults (no parsed data)')
          setStep(3)
        }, 1500)
      }
    } catch (error) {
      console.error('Resume parsing failed:', error)
      setParsingStatus(`Resume parsing failed: ${error.message}`)
      setParsingComplete(true)
      // Still go to step 3 with defaults
      setTimeout(() => setStep(3), 1500)
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: formData.role,
          experience: formData.experience,
          skills: formData.skills.split(',').map(s => s.trim())
        })
      })

      const result = await response.json()
      
      if (result.success && result.questions) {
        // Start the interview
        const sessionId = Date.now().toString()
        dispatch(startInterview({
          sessionId,
          candidateInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            resume: resumeFile?.name
          },
          questions: result.questions
        }))
      } else {
        dispatch(setError(result.error || 'Failed to generate questions'))
      }
    } catch (error) {
      dispatch(setError('Failed to generate questions'))
    }
    setLoading(false)
  }

  const canProceedToStep2 = resumeFile
  const canProceedToStep3 = true // Always allow step 3 after resume parsing
  const canStartInterview = formData.role?.trim() && formData.experience?.trim() && formData.skills?.trim()
  
  console.log('=== BUTTON STATE DEBUG ===')
  console.log('canStartInterview:', canStartInterview)
  console.log('formData.role:', formData.role)
  console.log('formData.experience:', formData.experience) 
  console.log('formData.skills:', formData.skills)
  console.log('=== END BUTTON STATE DEBUG ===')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 && 'Upload Resume'}
              {step === 2 && 'Complete Missing Information'}
              {step === 3 && 'Interview Configuration'}
            </h2>
            <p className="text-gray-600">
              {step === 1 && 'Upload your resume to automatically extract your information'}
              {step === 2 && 'Please provide any missing information not found in your resume'}
              {step === 3 && 'Configure your interview parameters and start'}
            </p>
          </div>
        </div>

        {/* Step 1: Resume Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Resume *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.docx"
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">PDF or DOCX (max 10MB)</p>
                </label>
              </div>
            </div>

            {resumeFile && !loading && !parsingComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-800">Resume uploaded successfully</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm text-blue-800">AI is parsing your resume...</span>
                </div>
              </div>
            )}

            {parsingComplete && parsedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Extracted Information:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  {parsedData.name && <div>• Name: {parsedData.name}</div>}
                  {parsedData.email && <div>• Email: {parsedData.email}</div>}
                  {parsedData.phone && <div>• Phone: {parsedData.phone}</div>}
                  {(!parsedData.name || !parsedData.email) && (
                    <div className="text-yellow-700 mt-2">Some information is missing and will be requested in the next step.</div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI will extract your name, email, and phone number</li>
                <li>• You&apos;ll only be asked to fill missing information</li>
                <li>• Then configure interview parameters and start</li>
              </ul>
            </div>

            <div className="pt-4">
              <button
                onClick={parseResume}
                disabled={!canProceedToStep2 || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Parsing Resume...' : 'Parse Resume & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Complete Missing Information */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Show parsing status */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">Please wait, fields will be auto-filled after parsing...</span>
                </div>
              </div>
            )}
            
            {/* Show parsed data if available */}
            {parsedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">📄 Extracted from Resume:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  {parsedData.name && <p>✓ Name: {parsedData.name}</p>}
                  {parsedData.email && <p>✓ Email: {parsedData.email}</p>}
                  {parsedData.phone && <p>✓ Phone: {parsedData.phone}</p>}
                </div>
              </div>
            )}

            {/* Check if any information is missing */}
            {(!formData.name?.trim() || !formData.email?.trim()) ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-yellow-900 mb-2">ℹ️ Please complete the missing information:</h4>
                </div>

                {/* Only show name field if missing */}
                {!formData.name?.trim() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                {/* Only show email field if missing */}
                {!formData.email?.trim() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your email address"
                    />
                  </div>
                )}

                {/* Only show phone field if missing */}
                {!formData.phone?.trim() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}
              </>
            ) : (
              /* All required information is available */
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-900 mb-2">All Information Complete!</h3>
                <p className="text-green-700 mb-4">
                  We successfully extracted all required information from your resume.
                </p>
                <div className="text-sm text-green-800 space-y-1">
                  <p>✓ Name: {formData.name}</p>
                  <p>✓ Email: {formData.email}</p>
                  {formData.phone && <p>✓ Phone: {formData.phone}</p>}
                </div>
              </div>
            )}

            <div className="pt-4 flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Resume
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Setup
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interview Configuration */}
        {step === 3 && (
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                type="text"
                name="role"
                key={`role-${formData.role}`}
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="e.g., Full Stack Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                key={`experience-${formData.experience}`}
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Entry-level">Entry-level (0-2 years)</option>
                <option value="Mid-level">Mid-level (3-5 years)</option>
                <option value="Senior-level">Senior-level (6+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                key={`skills-${formData.skills}`}
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="e.g., React, Node.js, JavaScript"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Interview Format</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 6 questions total (2 Easy, 2 Medium, 2 Hard)</li>
                <li>• Automatic timers for each question</li>
                <li>• Questions will auto-skip if time expires</li>
                <li>• AI-powered evaluation at the end</li>
              </ul>
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                onClick={() => {
                  // Go back to step 2 if we came from there, otherwise step 1
                  if (parsedData) {
                    setStep(2)
                  } else {
                    setStep(1)
                  }
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={generateQuestions}
                disabled={!canStartInterview || loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating Questions...' : 'Start Interview'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}