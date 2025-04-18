<TabsContent value="use-case">
  <Card className="mb-6">
    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
      <CardTitle className="flex items-center gap-2 text-xl text-purple-800">
        <span className="p-1.5 bg-purple-500 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </span>
        Use Case - SOW - SME
      </CardTitle>
      <CardDescription className="text-base text-purple-700">
        Define the use case, scope of work, and service commitment details for this project
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-6">
        {/* Opportunity Stage Ownership Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center gap-2">
            <span className="p-1 bg-purple-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </span>
            Opportunity Stage Ownership
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bdmOwner">BDM Name:</Label>
              <Input 
                id="bdmOwner"
                value={formData.bdmOwner} 
                onChange={(e) => handleFormChange("bdmOwner", e.target.value)}
                placeholder="Enter BDM name"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="salesEngineer">Sales Engineer:</Label>
              <Input 
                id="salesEngineer"
                value={formData.salesEngineer} 
                onChange={(e) => handleFormChange("salesEngineer", e.target.value)}
                placeholder="Enter SE name"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="kvgSme">KVG SME:</Label>
              <Input 
                id="kvgSme"
                value={formData.kvgSme} 
                onChange={(e) => handleFormChange("kvgSme", e.target.value)}
                placeholder="Enter KVG SME name"
                className="bg-white"
              />
            </div>
            <div>
              <Label htmlFor="opportunityStage">Opportunity Stage:</Label>
              <Select 
                value={formData.opportunityStage} 
                onValueChange={(value) => handleFormChange("opportunityStage", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identify">Identify</SelectItem>
                  <SelectItem value="Qualify">Qualify</SelectItem>
                  <SelectItem value="Expect">Expect</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Design Complete">Design Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
                
        {/* SOW Details Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-lg shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-4 text-purple-800 flex items-center gap-2">
            <span className="p-1 bg-purple-500 text-white rounded-md w-7 h-7 flex items-center justify-center text-sm shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
              </svg>
            </span>
            SOW Outline
          </h3>
                  
          {/* Incident Types - Criminal Activity Group */}
          <div className="bg-white/80 p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="text-md font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Z" />
              </svg>
              Criminal Activity
            </h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.obviousCriminalAct}
                  onPressedChange={(value) => handleFormChange("obviousCriminalAct", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.obviousCriminalAct ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Obvious Criminal Act</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.activeBreakIn}
                  onPressedChange={(value) => handleFormChange("activeBreakIn", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.activeBreakIn ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Active Break-in</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.destructionOfProperty}
                  onPressedChange={(value) => handleFormChange("destructionOfProperty", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.destructionOfProperty ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Destruction of Property</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carDrivingThroughGate}
                  onPressedChange={(value) => handleFormChange("carDrivingThroughGate", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carDrivingThroughGate ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Car Driving Through Gate</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carBurglaries}
                  onPressedChange={(value) => handleFormChange("carBurglaries", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carBurglaries ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Car Burglaries</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.trespassing}
                  onPressedChange={(value) => handleFormChange("trespassing", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.trespassing ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Trespassing</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.carsBrokenIntoAfterFact}
                  onPressedChange={(value) => handleFormChange("carsBrokenIntoAfterFact", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.carsBrokenIntoAfterFact ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Cars Broken Into (After Fact)</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.brokenGlassWindows}
                  onPressedChange={(value) => handleFormChange("brokenGlassWindows", value)}
                  className="data-[state=on]:bg-red-500 h-8 w-full"
                >
                  {formData.brokenGlassWindows ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Broken Glass/Windows</span>
              </div>
            </div>
                    
            {/* Suspicious Activity Group */}
            <h4 className="text-md font-semibold mb-4 mt-6 text-orange-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
              </svg>
              Suspicious Activity
            </h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.suspiciousActivity}
                  onPressedChange={(value) => handleFormChange("suspiciousActivity", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.suspiciousActivity ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Suspicious Activity</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.intentToCommitCriminalAct}
                  onPressedChange={(value) => handleFormChange("intentToCommitCriminalAct", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.intentToCommitCriminalAct ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Intent to Commit Criminal Act</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.checkingMultipleCarDoors}
                  onPressedChange={(value) => handleFormChange("checkingMultipleCarDoors", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.checkingMultipleCarDoors ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Checking Multiple Car Doors</span>
              </div>
              <div className="flex flex-col items-center">
                <Toggle 
                  pressed={formData.dumpsterDivingOrDumping}
                  onPressedChange={(value) => handleFormChange("dumpsterDivingOrDumping", value)}
                  className="data-[state=on]:bg-orange-500 h-8 w-full"
                >
                  {formData.dumpsterDivingOrDumping ? "Yes" : "No"}
                </Toggle>
                <span className="text-xs mt-1 text-center">Dumpster Diving/Dumping</span>
              </div>
            </div>
                    
            {/* Other Incident Type Groups would go here */}
            
            {/* Custom Incident Types */}
            <div className="mt-6 pt-4 border-t border-blue-200">
              <h4 className="text-md font-semibold mb-4 text-blue-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Custom Incident Types
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 bg-white/50 p-2 rounded border border-gray-200">
                  <Input 
                    value={formData.customIncidentType1}
                    onChange={(e) => handleFormChange("customIncidentType1", e.target.value)}
                    placeholder="Custom incident type"
                    className="bg-white flex-1"
                  />
                  <Toggle 
                    pressed={formData.customIncidentType1Selected}
                    onPressedChange={(value) => handleFormChange("customIncidentType1Selected", value)}
                    className="data-[state=on]:bg-green-500"
                  >
                    {formData.customIncidentType1Selected ? "Yes" : "No"}
                  </Toggle>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    value={formData.customIncidentType2}
                    onChange={(e) => handleFormChange("customIncidentType2", e.target.value)}
                    placeholder="Custom incident type"
                    className="bg-white flex-1"
                  />
                  <Toggle 
                    pressed={formData.customIncidentType2Selected}
                    onPressedChange={(value) => handleFormChange("customIncidentType2Selected", value)}
                    className="data-[state=on]:bg-green-500"
                  >
                    {formData.customIncidentType2Selected ? "Yes" : "No"}
                  </Toggle>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    value={formData.customIncidentType3}
                    onChange={(e) => handleFormChange("customIncidentType3", e.target.value)}
                    placeholder="Custom incident type"
                    className="bg-white flex-1"
                  />
                  <Toggle 
                    pressed={formData.customIncidentType3Selected}
                    onPressedChange={(value) => handleFormChange("customIncidentType3Selected", value)}
                    className="data-[state=on]:bg-green-500"
                  >
                    {formData.customIncidentType3Selected ? "Yes" : "No"}
                  </Toggle>
                </div>
              </div>
            </div>
                  
            {/* Use Case Commitment and Response */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <Label htmlFor="useCaseCommitment">Use Case Commitment:</Label>
                <Textarea 
                  id="useCaseCommitment"
                  value={formData.useCaseCommitment} 
                  onChange={(e) => handleFormChange("useCaseCommitment", e.target.value)}
                  placeholder="Fill in or modify from Discovery tab"
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="useCaseResponse">Use Case Response:</Label>
                <Textarea 
                  id="useCaseResponse"
                  value={formData.useCaseResponse} 
                  onChange={(e) => handleFormChange("useCaseResponse", e.target.value)}
                  placeholder="Fill in or modify from Discovery tab, add in any needs for RSPNDR Guard Dispatch on Demand Services"
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="sowDetailedOutline">SOW Detailed Outline:</Label>
                <Textarea 
                  id="sowDetailedOutline"
                  value={formData.sowDetailedOutline} 
                  onChange={(e) => handleFormChange("sowDetailedOutline", e.target.value)}
                  placeholder="Fill in from price quoting worksheet"
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div>
                <Label htmlFor="scheduleDetails">Schedule Details:</Label>
                <Textarea 
                  id="scheduleDetails"
                  value={formData.scheduleDetails} 
                  onChange={(e) => handleFormChange("scheduleDetails", e.target.value)}
                  placeholder="Fill in from tab on or detail complex schedules based on different days or camera groups"
                  className="bg-white min-h-[80px]"
                />
              </div>
            </div>
          </div>
                
          {/* Quote Attachment Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Paste Screen-shot of KVG Services Quote</h3>
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center mb-4">
              <div className="text-center mb-4">
                <Label htmlFor="quoteScreenshot" className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Click to upload quote screenshot</span>
                  <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 10MB)</span>
                  <Input id="quoteScreenshot" type="file" className="hidden" />
                </Label>
              </div>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                The KVG SME Quote must be attached before completing any CRM Opportunity Quote.
              </p>
            </div>
            <div className="mb-4">
              <Label htmlFor="quoteWithSowAttached">Quote with SOW Attached:</Label>
              <Select 
                value={formData.quoteWithSowAttached} 
                onValueChange={(value) => handleFormChange("quoteWithSowAttached", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
                
          {/* KVG Services Configuration Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Paste spreadsheet of KVG Services configuration from Calculator</h3>
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center mb-4">
              <div className="text-center mb-4">
                <Label htmlFor="configSpreadsheet" className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <ImageIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Click to upload spreadsheet</span>
                  <span className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 10MB)</span>
                  <Input id="configSpreadsheet" type="file" className="hidden" />
                </Label>
              </div>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                KVG SME to paste in this area from the KVG calculator "KVG Process Output" Rows 6 to End and Column A-Q. Paste in same columns here and add pics in columns designated after R.
              </p>
            </div>
            <div className="mb-4">
              <Label htmlFor="quoteDesignAttached">Quote Design Attached:</Label>
              <Select 
                value={formData.quoteDesignAttached} 
                onValueChange={(value) => handleFormChange("quoteDesignAttached", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>