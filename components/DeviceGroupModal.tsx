import React, { useState } from "react";
import {
  Input,
  Button,
  Notification,
  Modal,
  Form,
} from "@canonical/react-components";

import { createDeviceGroup } from "@/utils/createDeviceGroup";

function isValidIP(ip: string) {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  return regex.test(ip);
}

function isValidMTU(mtu: number) {
  return mtu >= 1200 && mtu <= 65535;
}

function isValidCIDR(cidr: string) {
  const regex =
    /^((25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\/([1-9]|[1-2][0-9]|3[0-2])$/;
  return regex.test(cidr);
}

function isValidMBR(mbr: number) {
  return mbr >= 0 && mbr <= 1000000;
}

interface DeviceGroupModalProps {
  toggleModal: () => void;
  onDeviceGroupCreated: () => void;
  networkSliceName: string;
}

export default function DeviceGroupModal({
  toggleModal,
  onDeviceGroupCreated,
  networkSliceName,
}: DeviceGroupModalProps) {
  const [name, setName] = useState<string>("");
  const [ueIpPool, setUeIpPool] = useState<string>("");
  const [dns, setDns] = useState<string>("8.8.8.8");
  const [mtu, setMtu] = useState<number>(1460);
  const [MBRDownstreamMbps, setMBRDownstream] = useState<number | null>(null);
  const [MBRUpstreamMbps, setMBRUpstream] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [NameValidationError, setNameValidationError] = useState<string | null>(
    null,
  );
  const [UEIPPoolValidationError, setUEIPPoolValidationError] = useState<
    string | null
  >(null);
  const [DNSValidationError, setDNSValidationError] = useState<string | null>(
    null,
  );
  const [MTUValidationError, setMTUValidationError] = useState<string | null>(
    null,
  );
  const [MBRDownstreamValidationError, setMBRDownstreamError] = useState<
    string | null
  >(null);
  const [MBRUpstreamValidationError, setMBRUpstreamError] = useState<
    string | null
  >(null);

  const isCreateDisabled =
    !name ||
    !ueIpPool ||
    !dns ||
    mtu === null ||
    MBRDownstreamMbps === null ||
    MBRUpstreamMbps === null ||
    NameValidationError !== null ||
    UEIPPoolValidationError !== null ||
    DNSValidationError !== null ||
    MTUValidationError !== null ||
    MBRDownstreamValidationError !== null ||
    MBRUpstreamValidationError !== null;

  const handleCreate = async () => {
    if (!MBRUpstreamMbps) {
      setApiError("Please select a value for the upstream bitrate.");
      return;
    }
    if (!MBRDownstreamMbps) {
      setApiError("Please select a value for the downstream bitrate.");
      return;
    }
    const MBRUpstreamBps = MBRUpstreamMbps * 1000000;
    const MBRDownstreamBps = MBRDownstreamMbps * 1000000;
    try {
      await createDeviceGroup({
        name: name,
        ueIpPool: ueIpPool,
        dns: dns,
        mtu: mtu,
        MBRUpstreamBps: MBRUpstreamBps,
        MBRDownstreamBps: MBRDownstreamBps,
        networkSliceName: networkSliceName,
      });
      onDeviceGroupCreated();
      toggleModal();
    } catch (error) {
      console.error(error);
      setApiError("Failed to create device group.");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);

    if (value.length > 20) {
      setNameValidationError("Name should not exceed 20 characters.");
    } else {
      setNameValidationError(null);
    }
  };
  const handleUEIPPoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUeIpPool(value);
    if (!isValidCIDR(value)) {
      setUEIPPoolValidationError("Invalid IP Address Pool.");
    } else {
      setUEIPPoolValidationError(null);
    }
  };
  const handleDNSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDns(value);

    if (!isValidIP(value)) {
      setDNSValidationError("Invalid IP Address.");
    } else {
      setDNSValidationError(null);
    }
  };
  const handleMTUChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMtu(Number(value));
    if (!isValidMTU(value)) {
      setMTUValidationError("Invalid MTU.");
    } else {
      setMTUValidationError(null);
    }
  };

  const handleMBRDownstreamChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value, 10);
    setMBRDownstream(value);
    if (!isValidMBR(value)) {
      setMBRDownstreamError("Value should be between 0 and 1,000,000.");
    } else {
      setMBRDownstreamError(null);
    }
  };

  const handleMBRUpstreamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMBRUpstream(value);
    if (!isValidMBR(value)) {
      setMBRUpstreamError("Value should be between 0 and 1,000,000.");
    } else {
      setMBRUpstreamError(null);
    }
  };
  return (
    <Modal
      title={"Create Device Group for slice: " + networkSliceName}
      close={toggleModal}
      buttonRow={
        <Button
          appearance="positive"
          className="mt-8"
          onClick={handleCreate}
          disabled={isCreateDisabled}
        >
          Create
        </Button>
      }
    >
      {apiError && (
        <Notification severity="negative" title="Error">
          {apiError}
        </Notification>
      )}
      <Form>
        <Input
          type="text"
          id="name"
          label="Name"
          placeholder="default"
          onChange={handleNameChange}
          stacked
          error={NameValidationError}
        />
        <Input
          type="text"
          id="ue-ip-pool"
          label="Subscriber IP Pool"
          placeholder="172.250.1.0/16"
          onChange={handleUEIPPoolChange}
          stacked
          error={UEIPPoolValidationError}
        />
        <Input
          type="text"
          id="dns"
          label="DNS"
          defaultValue={"8.8.8.8"}
          onChange={handleDNSChange}
          stacked
          error={DNSValidationError}
        />
        <Input
          type="text"
          id="mtu"
          label="MTU"
          defaultValue={"1460"}
          onChange={handleMTUChange}
          stacked
          error={MTUValidationError}
        />
        <fieldset>
          <legend>Maximum Bitrate (Mbps)</legend>
          <Input
            placeholder="20"
            id="mbr-downstream"
            type="number"
            onChange={handleMBRDownstreamChange}
            stacked
            label="Downstream"
            error={MBRDownstreamValidationError}
          />
          <Input
            placeholder="5"
            id="mbr-upstream"
            type="number"
            onChange={handleMBRUpstreamChange}
            stacked
            label="Upstream"
            error={MBRUpstreamValidationError}
          />
        </fieldset>
      </Form>
    </Modal>
  );
}
