import React from 'react';
import {
  Hero,
  OrbLeft,
  OrbRight,
  Title,
  Subtitle,
  Stats,
  StatCard,
  StatLabel,
  StatValue
} from '../../core/styles/App.styles.js';

function HeroStatsSection({
  pageTitle,
  pageSubtitle,
  approvedCount,
  disapprovedCount,
  needsReviewCount,
  copy
}) {
  return React.createElement(
    Hero,
    null,
    React.createElement(OrbLeft, null),
    React.createElement(OrbRight, null),
    React.createElement(Title, null, pageTitle),
    React.createElement(Subtitle, null, pageSubtitle),
    React.createElement(
      Stats,
      null,
      React.createElement(
        StatCard,
        null,
        React.createElement(StatLabel, null, copy.statsApproved),
        React.createElement(StatValue, null, approvedCount)
      ),
      React.createElement(
        StatCard,
        null,
        React.createElement(StatLabel, null, copy.statsRejected),
        React.createElement(StatValue, null, disapprovedCount)
      ),
      React.createElement(
        StatCard,
        null,
        React.createElement(StatLabel, null, copy.statsNeedsReview),
        React.createElement(StatValue, null, needsReviewCount)
      )
    )
  );
}

export { HeroStatsSection };
