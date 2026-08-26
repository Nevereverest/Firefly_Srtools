import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { connectPersistedSchema } from '@/zod';
import { createValidatedJSONStorage } from './persistStorage';


interface ConnectState {
    connectionType: string;
    privateType: string;
    serverUrl: string;
    username: string;
    password: string;
    setConnectionType: (newConnectionType: string) => void;
    setPrivateType: (newPrivateType: string) => void;
    setServerUrl: (newServerUrl: string) => void;
    setUsername: (newUsername: string) => void;
    setPassword: (newPassword: string) => void;
}

type ConnectPersistedState = Pick<ConnectState, "connectionType" | "privateType" | "serverUrl" | "username" | "password">;

const useConnectStore = create<ConnectState>()(
    persist<ConnectState, [], [], ConnectPersistedState>(
        (set) => ({
            connectionType: "FireflyGo",
            privateType: "Local",
            serverUrl: "http://localhost:21000",
            username: "",
            password: "",
            setConnectionType: (newConnectionType: string) => set({ connectionType: newConnectionType }),
            setPrivateType: (newPrivateType: string) => set({ privateType: newPrivateType }),
            setServerUrl: (newServerUrl: string) => set({ serverUrl: newServerUrl }),
            setUsername: (newUsername: string) => set({ username: newUsername }),
            setPassword: (newPassword: string) => set({ password: newPassword }),
        }),
        {
            name: 'connect-storage',
            storage: createValidatedJSONStorage(() => localStorage, connectPersistedSchema),
            partialize: (state) => ({
                connectionType: state.connectionType,
                privateType: state.privateType,
                serverUrl: state.serverUrl,
                username: state.username,
                password: state.password,
            }),
        }
    )
);

export default useConnectStore;
