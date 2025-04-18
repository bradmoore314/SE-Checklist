        {/* Stream Details Tab Content */}
        <TabsContent value="stream-details">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📹</span> Camera Video Stream Details
              </CardTitle>
              <CardDescription>Configure and manage your camera streams with detailed settings for monitoring and patrol groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={() => addStream()} className="flex items-center gap-1">
                  <Plus size={16} /> Add Stream
                </Button>
              </div>
              
              {streams.length > 0 ? (
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="text-xs bg-gray-100">
                      <tr className="border-b border-gray-300">
                        <th colSpan={3} className="px-2 py-3 text-center bg-teal-100">Camera Video Stream Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-blue-100">FOV Area Accessibility</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-indigo-100">Camera Type & Environment</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-purple-100">Unique Use Case Problem</th>
                        <th colSpan={2} className="px-2 py-3 text-center bg-pink-100">Speaker Video Stream Association & Name</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-orange-100">Event Monitoring Details</th>
                        <th colSpan={3} className="px-2 py-3 text-center bg-red-100">Patrol Group Details</th>
                        <th colSpan={1} className="px-2 py-3 text-center bg-gray-200">Actions</th>
                      </tr>
                      <tr className="border-b text-center">
                        <th className="px-2 py-2 w-10">Stream #</th>
                        <th className="px-2 py-2 w-60">Camera/Video Stream Location/Name</th>
                        <th className="px-2 py-2 w-16">Images</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-28">Environment</th>
                        <th className="px-2 py-2 w-60">Problem Description</th>
                        <th className="px-2 py-2 w-40">Association</th>
                        <th className="px-2 py-2 w-20">Audio Talk-Down Y/N</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-32">Start Time</th>
                        <th className="px-2 py-2 w-32">End Time</th>
                        <th className="px-2 py-2 w-20">Y/N</th>
                        <th className="px-2 py-2 w-32">Start Time</th>
                        <th className="px-2 py-2 w-32">End Time</th>
                        <th className="px-2 py-2 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streams.map((stream) => (
                        <tr key={stream.id} className="border-b hover:bg-gray-50">
                          <td className="px-2 py-3 text-center font-medium">{stream.id}</td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.location || ""}
                              onChange={(e) => updateStream(stream.id, "location", e.target.value)}
                              className="h-14"
                              placeholder="Enter the location and naming of the camera video stream - see note example"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedStream(stream);
                                  setShowStreamImagesModal(true);
                                }}
                                className="flex items-center gap-1"
                                title="View Images"
                              >
                                <ImageIcon size={14} /> {stream.images.length}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUploadStreamImageClick(stream.id)}
                                className="px-2"
                                title="Upload Image"
                              >
                                <Upload size={14} />
                              </Button>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.fovAccessibility}
                              onValueChange={(value) => updateStream(stream.id, "fovAccessibility", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.cameraType}
                              onValueChange={(value) => updateStream(stream.id, "cameraType", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Indoor">Indoor</SelectItem>
                                <SelectItem value="Outdoor">Outdoor</SelectItem>
                                <SelectItem value="PTZ">PTZ</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.useCaseProblem || ""}
                              onChange={(e) => updateStream(stream.id, "useCaseProblem", e.target.value)}
                              className="h-14"
                              placeholder="Enter any unique use case problem for this camera or scene if different from the site problem defined above."
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Textarea 
                              value={stream.speakerAssociation || ""}
                              onChange={(e) => updateStream(stream.id, "speakerAssociation", e.target.value)}
                              className="h-14"
                              placeholder="Fill in if speaker is dedicated to single camera or a group of cameras (ref numbers in column A)"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.audioTalkDown}
                              onValueChange={(value) => updateStream(stream.id, "audioTalkDown", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.eventMonitoring}
                              onValueChange={(value) => updateStream(stream.id, "eventMonitoring", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.monitoringStartTime || ""}
                              onChange={(e) => updateStream(stream.id, "monitoringStartTime", e.target.value)}
                              className="h-8"
                              placeholder="Start Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.monitoringEndTime || ""}
                              onChange={(e) => updateStream(stream.id, "monitoringEndTime", e.target.value)}
                              className="h-8"
                              placeholder="End Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Select 
                              value={stream.patrolGroups}
                              onValueChange={(value) => updateStream(stream.id, "patrolGroups", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Select">Select</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.patrolStartTime || ""}
                              onChange={(e) => updateStream(stream.id, "patrolStartTime", e.target.value)}
                              className="h-8"
                              placeholder="Start Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3">
                            <Input 
                              type="time"
                              value={stream.patrolEndTime || ""}
                              onChange={(e) => updateStream(stream.id, "patrolEndTime", e.target.value)}
                              className="h-8"
                              placeholder="End Time Entry"
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex flex-col gap-1 items-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addStream(stream)}
                                title="Duplicate Stream"
                                className="w-9 h-9 p-0"
                              >
                                <Copy size={16} />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeStream(stream.id)}
                                title="Remove Stream"
                                className="w-9 h-9 p-0"
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 p-8 border rounded-md text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <VideoIcon size={48} className="text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No Camera Streams Configured</h3>
                  </div>
                  <p className="max-w-md mx-auto mb-4">
                    Start by adding camera streams to configure video monitoring and patrol settings for your KVG project.
                  </p>
                  <Button onClick={() => addStream()} className="flex items-center gap-2">
                    <Plus size={16} /> Add Your First Stream
                  </Button>
                </div>
              )}
              
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <h3 className="text-md font-semibold flex items-center gap-2 mb-2">
                  <InfoIcon size={18} className="text-blue-600" />
                  About Camera Streams
                </h3>
                <p className="text-sm">
                  Configure each camera streams with its associated monitoring and patrol details. You can associate speakers with cameras, 
                  set up event monitoring schedules, and define patrol group timings for each stream. Use the duplicate function to quickly create similar streams.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>