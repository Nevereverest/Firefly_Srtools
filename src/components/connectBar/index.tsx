"use client"

import { connectToPS, syncDataToPS } from "@/helper"
import useConnectStore from "@/stores/connectStore"
import useGlobalStore from "@/stores/globalStore"
import { PSConnectType } from "@/types"
import { useTranslations } from "next-intl"
import { useState } from "react"

export default function ConnectBar() {
    const transI18n = useTranslations("DataPage")
    const [message, setMessage] = useState({ text: '', type: '' });
    const {
        connectionType,
        privateType,
        serverUrl,
        username,
        password,
        setConnectionType,
        setPrivateType,
        setServerUrl,
        setUsername,
        setPassword
    } = useConnectStore()
    const { isConnectPS, setIsConnectPS } = useGlobalStore()

    return (
        <div className="px-6 py-4">
            <div className="form-control grid grid-cols-1 w-full mb-6">
                <label className="label">
                    <span className="label-text font-semibold text-purple-300">{transI18n("connectionType")}</span>
                </label>
                <select
                    className="select w-full select-bordered border-purple-500/30 focus:border-purple-500 bg-base-200 mt-1"
                    value={connectionType}
                    onChange={(e) => { 
                        setIsConnectPS(false) 
                        setConnectionType(e.target.value)
                    }}
                >
                    <option value={PSConnectType.FireflyGo}>FireflyGo</option>
                    <option value={PSConnectType.RobinSR}>RobinSR</option>
                    <option value={PSConnectType.Other}>{transI18n("other")}</option>
                </select>
            </div>

            {connectionType === PSConnectType.Other && (
                <div className="flex flex-col md:space-x-4 mb-6 gap-2">
                    <div className="form-control w-full mb-4 md:mb-0">
                        <label className="label">
                            <span className="label-text font-semibold text-purple-300">{transI18n("serverUrl")}</span>
                        </label>
                        <input
                            type="text"
                            placeholder={transI18n("placeholderServerUrl")}
                            className="input input-bordered w-full border-purple-500/30 focus:border-purple-500 bg-base-200 mt-1"
                            value={serverUrl}
                            onChange={(e) => setServerUrl(e.target.value)}
                        />
                    </div>
                    <div className="form-control w-full mb-4 md:mb-0">
                        <label className="label">
                            <span className="label-text font-semibold text-purple-300">{transI18n("privateType")}</span>
                        </label>
                        <select
                            className="select w-full select-bordered border-purple-500/30 focus:border-purple-500 bg-base-200 mt-1"
                            value={privateType}
                            onChange={(e) => setPrivateType(e.target.value)}
                        >
                            <option value="Local">{transI18n("local")}</option>
                            <option value="Server">{transI18n("server")}</option>
                        </select>
                    </div>

                    <div className="form-control w-full mb-4 md:mb-0">
                        <label className="label">
                            <span className="label-text font-semibold text-purple-300">{transI18n("username")}</span>
                        </label>
                        <input
                            type="text"
                            placeholder={transI18n("placeholderUsername")}
                            className="input input-bordered w-full border-purple-500/30 focus:border-purple-500 bg-base-200 mt-1"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-control w-full mb-4 md:mb-0">
                        <label className="label">
                            <span className="label-text font-semibold text-purple-300">{transI18n("password")}</span>
                        </label>
                        <input
                            type="password"
                            placeholder={transI18n("placeholderPassword")}
                            className="input input-bordered w-full border-purple-500/30 focus:border-purple-500 bg-base-200 mt-1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' :
                    message.type === 'error' ? 'alert-error' : 'alert-info'
                    } mb-6`}>
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-2">
                <div className="flex items-center justify-center md:justify-start">
                    <span className="text-md mr-2">{transI18n("status")}:</span>
                    <span
                        className={`badge ${isConnectPS ? "badge-success" : "badge-error"
                            } badge-lg`}
                    >
                        {isConnectPS ? transI18n("connected") : transI18n("unconnected")}
                    </span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full justify-center md:justify-end">
                    <button
                        onClick={async () => {
                            const response = await connectToPS();
                            if (response.success) {
                                setMessage({
                                    type: "success",
                                    text: transI18n("connectedSuccess"),
                                });
                            } else {
                                setMessage({
                                    type: "error",
                                    text: response.message,
                                });
                            }
                        }}
                        className="btn btn-primary w-full sm:w-auto"
                    >
                        {transI18n("connectPs")}
                    </button>

                    {isConnectPS && (
                        <button
                            onClick={async () => {
                                const response = await syncDataToPS();
                                if (response.success) {
                                    setMessage({
                                        type: "success",
                                        text: transI18n("syncSuccess"),
                                    });
                                } else {
                                    setMessage({
                                        type: "error",
                                        text: `${transI18n("syncFailed")}: ${response.message}`,
                                    });
                                }
                            }}
                            className="btn btn-success w-full sm:w-auto"
                        >
                            {transI18n("sync")}
                        </button>
                    )}
                </div>
            </div>

        </div>
    )
}