import * as React from 'react';
import { Text } from '@fluentui/react';
import { IGroupCardProps } from './IGroupCardProps';

const cardStyle: React.CSSProperties = {
  border: '1px solid #edebe9',
  borderRadius: 4,
  padding: 16,
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const headerStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 12,
  borderBottom: '1px solid #edebe9',
  paddingBottom: 8,
};

const memberStyle: React.CSSProperties = {
  padding: '4px 0',
  color: '#323130',
};

const GroupCard: React.FC<IGroupCardProps> = ({ groupNumber, members }) => (
  <div style={cardStyle}>
    <Text variant="large" style={headerStyle} block>
      Group {groupNumber}
    </Text>
    {members.map((name, i) => (
      <Text key={i} variant="medium" style={memberStyle} block>
        {name}
      </Text>
    ))}
  </div>
);

export default GroupCard;
